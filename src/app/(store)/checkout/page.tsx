"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCartStore, useCartHydrated } from "@/lib/stores/cart.store";
import { formatPrice } from "@/lib/utils";

const CheckoutFormSchema = z.object({
  email: z.string().email("Valid email required"),
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  line1: z.string().min(1, "Address required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City required"),
  province: z.string().min(1, "Province required"),
  postalCode: z.string().min(4, "Postal code required"),
});

type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;

function redirectToPayFast(actionUrl: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = actionUrl;
  Object.entries(fields).forEach(([k, v]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = k;
    input.value = v;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

export default function CheckoutPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { items, total, clearCart } = useCartStore();
  const hydrated = useCartHydrated();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutFormSchema),
  });

  async function onSubmit(data: CheckoutFormData) {
    if (items.length === 0) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          address: {
            line1: data.line1,
            line2: data.line2,
            city: data.city,
            province: data.province,
            postalCode: data.postalCode,
            country: "ZA",
          },
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            sku: item.variantId ?? item.productId,
            quantity: item.quantity,
            unitPrice: item.price,
            image: item.image,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed to create order");

      const { actionUrl, fields } = (await res.json()) as {
        actionUrl: string;
        fields: Record<string, string>;
      };
      clearCart();
      redirectToPayFast(actionUrl, fields);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "w-full bg-transparent border border-iron text-ivory text-sm font-sans font-light px-4 py-3 placeholder:text-ash focus:outline-none focus:border-gold-antique transition-colors";
  const errorClass = "text-crimson text-xs font-sans mt-1";

  return (
    <div className="min-h-screen pt-32 pb-24 px-8 max-w-6xl mx-auto">
      <h1 className="font-display text-ivory font-light text-4xl mb-12">
        Checkout
      </h1>

      {!hydrated ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-8 h-8 border border-gold-warm/40 border-t-gold-warm rounded-full animate-spin mx-auto mb-4" />
            <p className="text-ash text-sm font-sans">Loading your cart...</p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-parchment font-sans font-light text-lg mb-4">Your cart is empty</p>
          <a
            href="/shop"
            className="inline-block bg-gold-warm text-obsidian text-xs tracking-[0.14em] uppercase font-sans font-medium px-10 py-4 hover:bg-gold-bright transition-colors duration-300"
          >
            Continue Shopping
          </a>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-ivory text-xs tracking-[0.14em] uppercase font-sans">
              Contact Information
            </h2>
            <input
              {...register("email")}
              placeholder="Email address"
              className={inputClass}
            />
            {errors.email && (
              <p className={errorClass}>{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-ivory text-xs tracking-[0.14em] uppercase font-sans">
              Shipping Address
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  {...register("firstName")}
                  placeholder="First name"
                  className={inputClass}
                />
                {errors.firstName && (
                  <p className={errorClass}>{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <input
                  {...register("lastName")}
                  placeholder="Last name"
                  className={inputClass}
                />
                {errors.lastName && (
                  <p className={errorClass}>{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <input
              {...register("line1")}
              placeholder="Address line 1"
              className={inputClass}
            />
            {errors.line1 && (
              <p className={errorClass}>{errors.line1.message}</p>
            )}
            <input
              {...register("line2")}
              placeholder="Address line 2 (optional)"
              className={inputClass}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  {...register("city")}
                  placeholder="City"
                  className={inputClass}
                />
                {errors.city && (
                  <p className={errorClass}>{errors.city.message}</p>
                )}
              </div>
              <div>
                <input
                  {...register("province")}
                  placeholder="Province"
                  className={inputClass}
                />
                {errors.province && (
                  <p className={errorClass}>{errors.province.message}</p>
                )}
              </div>
            </div>
            <input
              {...register("postalCode")}
              placeholder="Postal code"
              className={inputClass}
            />
            {errors.postalCode && (
              <p className={errorClass}>{errors.postalCode.message}</p>
            )}
          </div>

          {error && (
            <p className="text-crimson text-sm font-sans border border-crimson/30 px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className="w-full bg-gold-warm text-obsidian text-xs tracking-[0.14em] uppercase font-sans font-medium py-4 hover:bg-gold-bright transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "Processing..."
              : `Pay ${formatPrice(total)} with PayFast`}
          </button>
        </form>

        {/* Order Summary */}
        <div className="space-y-4">
          <h2 className="text-ivory text-xs tracking-[0.14em] uppercase font-sans mb-6">
            Order Summary
          </h2>
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between gap-4 py-3 border-b border-iron/50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-ivory text-sm font-sans font-light truncate">
                  {item.name}
                </p>
                {item.variantName && (
                  <p className="text-ash text-xs font-sans">{item.variantName}</p>
                )}
                <p className="text-ash text-xs font-sans">Qty: {item.quantity}</p>
              </div>
              <p className="text-gold-warm text-sm font-sans flex-shrink-0">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
          <div className="flex justify-between pt-4 border-t border-iron">
            <span className="text-ash text-sm font-sans uppercase tracking-[0.1em]">
              Total
            </span>
            <span className="text-gold-warm font-sans text-lg font-light">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
