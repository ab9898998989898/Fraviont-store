"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import type { InferSelectModel } from "drizzle-orm";
import type { products, productVariants } from "@/server/db/schema";

type Product = InferSelectModel<typeof products>;
type Variant = InferSelectModel<typeof productVariants>;

const VariantSchema = z.object({
  sku: z.string().min(1, "SKU required"),
  name: z.string().min(1, "Name required"),
  price: z.number().int().positive().optional(),
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(10),
  weight: z.number().int().positive().optional(),
});

const ProductFormSchema = z.object({
  slug: z.string().min(1, "Slug required"),
  name: z
    .string()
    .trim()
    .min(3, "Min 3 characters")
    .max(100, "Max 100 characters")
    .regex(/^[a-zA-Z0-9-'\s]+$/, "Letters, numbers, hyphens, apostrophes only"),
  shortDescription: z
    .string()
    .min(10, "Min 10 characters")
    .max(500, "Max 500 characters")
    .regex(/^[a-zA-Z0-9\s.,!?'"()\-]+$/, "Alphanumeric and basic punctuation only")
    .optional(),
  description: z
    .string()
    .min(10, "Min 10 characters")
    .max(500, "Max 500 characters")
    .regex(/^[a-zA-Z0-9\s.,!?'"()\-]+$/, "Alphanumeric and basic punctuation only")
    .optional(),
  price: z.number().int().positive("Price required"),
  compareAtPrice: z.number().int().positive().optional(),
  category: z.enum(["perfumes", "cosmetics", "jewelry", "gift_sets"]),
  subcategory: z.string().optional(),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  ingredients: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  variants: z.array(VariantSchema).default([]),
});

type ProductFormData = z.infer<typeof ProductFormSchema>;

interface ProductFormProps {
  product?: Product & { variants: Variant[] };
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "basic" | "media" | "description" | "variants" | "seo"
  >("basic");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: product
      ? {
          slug: product.slug,
          name: product.name,
          shortDescription: product.shortDescription ?? "",
          description: product.description ?? "",
          price: product.price,
          compareAtPrice: product.compareAtPrice ?? undefined,
          category: product.category,
          subcategory: product.subcategory ?? "",
          images: Array.isArray(product.images) ? (product.images as string[]) : [],
          tags: Array.isArray(product.tags) ? (product.tags as string[]) : [],
          ingredients: product.ingredients ?? "",
          isActive: product.isActive ?? true,
          isFeatured: product.isFeatured ?? false,
          metaTitle: product.metaTitle ?? "",
          metaDescription: product.metaDescription ?? "",
          variants: product.variants.map((v) => ({
            sku: v.sku,
            name: v.name,
            price: v.price ?? undefined,
            stock: v.stock,
            lowStockThreshold: v.lowStockThreshold ?? 10,
            weight: v.weight ?? undefined,
          })),
        }
      : {
          isActive: true,
          isFeatured: false,
          images: [],
          tags: [],
          variants: [],
          category: "perfumes",
        },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  const createMutation = api.products.create.useMutation({
    onSuccess: () => {
      toast.success("Product created");
      router.push("/admin/products");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = api.products.update.useMutation({
    onSuccess: () => toast.success("Product saved"),
    onError: (e) => toast.error(e.message),
  });

  const generateDescMutation = api.ai.generateDescription.useMutation({
    onSuccess: (data) => {
      if (data.description) setValue("description", data.description);
      if (data.aiDescription) setValue("description", data.aiDescription);
      toast.success("Description generated");
    },
    onError: (e) => toast.error(e.message),
  });

  const generateSEOMutation = api.ai.generateSEO.useMutation({
    onSuccess: (data) => {
      if (data.metaTitle) setValue("metaTitle", data.metaTitle);
      if (data.metaDescription) setValue("metaDescription", data.metaDescription);
      toast.success("SEO generated");
    },
    onError: (e) => toast.error(e.message),
  });

  async function onSubmit(data: ProductFormData) {
    if (product) {
      await updateMutation.mutateAsync({ id: product.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
  }

  const inputClass =
    "w-full bg-transparent border border-[#2A2A2A] text-ivory text-sm font-sans font-light px-4 py-3 placeholder:text-ash focus:outline-none focus:border-gold-antique transition-colors";
  const labelClass =
    "text-ash text-xs tracking-[0.14em] uppercase font-sans block mb-2";
  const errorClass = "text-crimson text-xs font-sans mt-1";

  const TABS = ["basic", "media", "description", "variants", "seo"] as const;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-0 border-b border-[#1E1E1E]">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-xs tracking-[0.14em] uppercase font-sans transition-colors ${
              activeTab === tab
                ? "text-gold-warm border-b-2 border-gold-warm -mb-px"
                : "text-ash hover:text-parchment"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Basic Info */}
      {activeTab === "basic" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Name *</label>
            <input {...register("name")} className={inputClass} placeholder="Product name" />
            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Slug *</label>
            <input {...register("slug")} className={inputClass} placeholder="product-slug" />
            {errors.slug && <p className={errorClass}>{errors.slug.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Category *</label>
            <select {...register("category")} className={inputClass}>
              <option value="perfumes bg-black">Perfumes</option>
              <option value="cosmetics bg-black">Cosmetics</option>
              <option value="jewelry bg-black">Jewelry</option>
              <option value="gift_sets bg-black">Gift Sets</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Subcategory</label>
            <input
              {...register("subcategory")}
              className={inputClass}
              placeholder="e.g. Eau de Parfum"
            />
          </div>
          <div>
            <label className={labelClass}>Price (cents) *</label>
            <input
              {...register("price", { valueAsNumber: true })}
              type="number"
              className={inputClass}
              placeholder="28500 = R285.00"
            />
            {errors.price && <p className={errorClass}>{errors.price.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Compare At Price (cents)</label>
            <input
              {...register("compareAtPrice", { valueAsNumber: true })}
              type="number"
              className={inputClass}
              placeholder="Optional"
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Short Description</label>
            <textarea
              {...register("shortDescription")}
              className={inputClass}
              rows={2}
              placeholder="Brief product summary"
            />
            {errors.shortDescription && <p className={errorClass}>{errors.shortDescription.message}</p>}
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register("isActive")} type="checkbox" className="accent-gold-warm" />
              <span className="text-parchment text-sm font-sans">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register("isFeatured")} type="checkbox" className="accent-gold-warm" />
              <span className="text-parchment text-sm font-sans">Featured</span>
            </label>
          </div>
        </div>
      )}

      {/* Media */}
      {activeTab === "media" && (
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Upload Images</label>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className={inputClass}
              onChange={(e) => {
                const files = e.target.files;
                if (!files) return;
                
                const currentImages = watch("images") ?? [];
                
                Array.from(files).forEach((file) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const base64String = reader.result as string;
                    setValue("images", [...watch("images"), base64String]);
                  };
                  reader.readAsDataURL(file);
                });
                
                // Clear input after processing
                e.target.value = "";
              }}
            />
            <p className="text-ash text-xs font-sans mt-2">Select files from your computer</p>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-[#1E1E1E]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#0A0A0A] px-2 text-ash text-xs tracking-[0.14em] uppercase font-sans">
                OR PASTE LINKS
              </span>
            </div>
          </div>

          <div>
            <label className={labelClass}>Image URLs (one per line)</label>
          <textarea
            className={inputClass}
            rows={6}
            placeholder={"https://example.com/image1.jpg\nhttps://example.com/image2.jpg"}
            onChange={(e) => {
              const urls = e.target.value
                .split("\n")
                .map((u) => u.trim())
                .filter(Boolean);
              setValue("images", urls);
            }}
            defaultValue={(watch("images") ?? []).join("\n")}
          />
          <p className="text-ash text-xs font-sans mt-2">Current images: {(watch("images") ?? []).length}</p>
          
          {/* Image Preview Area */}
          {(watch("images") ?? []).length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              {(watch("images") ?? []).map((img, i) => (
                <div key={i} className="relative aspect-square border border-iron bg-[#111111]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = [...watch("images")];
                      newImages.splice(i, 1);
                      setValue("images", newImages);
                    }}
                    className="absolute top-2 right-2 bg-crimson text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      )}

      {/* Description */}
      {activeTab === "description" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className={labelClass}>Description</label>
            {product && (
              <button
                type="button"
                onClick={() => generateDescMutation.mutate({ productId: product.id })}
                disabled={generateDescMutation.isPending}
                className="flex items-center gap-2 text-gold-warm text-xs tracking-[0.14em] uppercase font-sans hover:text-gold-bright transition-colors disabled:opacity-50"
              >
                {generateDescMutation.isPending && (
                  <Loader2 size={12} className="animate-spin" />
                )}
                Generate with AI
              </button>
            )}
          </div>
          <textarea
            {...register("description")}
            className={inputClass}
            rows={10}
            placeholder="Full product description..."
          />
          {errors.description && <p className={errorClass}>{errors.description.message}</p>}
          <div>
            <label className={labelClass}>Ingredients / Details</label>
            <textarea
              {...register("ingredients")}
              className={inputClass}
              rows={4}
              placeholder="Ingredients or product details..."
            />
          </div>
        </div>
      )}

      {/* Variants */}
      {activeTab === "variants" && (
        <div className="space-y-4">
          {variantFields.map((field, i) => (
            <div key={field.id} className="border border-[#1E1E1E] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-ivory text-xs font-sans uppercase tracking-widest">
                  Variant {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="text-ash hover:text-crimson transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>SKU *</label>
                  <input
                    {...register(`variants.${i}.sku`)}
                    className={inputClass}
                    placeholder="SKU-001"
                  />
                </div>
                <div>
                  <label className={labelClass}>Name *</label>
                  <input
                    {...register(`variants.${i}.name`)}
                    className={inputClass}
                    placeholder="50ml"
                  />
                </div>
                <div>
                  <label className={labelClass}>Price Override (cents)</label>
                  <input
                    {...register(`variants.${i}.price`, { valueAsNumber: true })}
                    type="number"
                    className={inputClass}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className={labelClass}>Stock</label>
                  <input
                    {...register(`variants.${i}.stock`, { valueAsNumber: true })}
                    type="number"
                    className={inputClass}
                    defaultValue={0}
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              appendVariant({ sku: "", name: "", stock: 0, lowStockThreshold: 10 })
            }
            className="flex items-center gap-2 text-gold-warm text-xs tracking-[0.14em] uppercase font-sans hover:text-gold-bright transition-colors"
          >
            <Plus size={14} />
            Add Variant
          </button>
        </div>
      )}

      {/* SEO */}
      {activeTab === "seo" && (
        <div className="space-y-4">
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={() => generateSEOMutation.mutate({ 
                name: watch("name"), 
                description: watch("description") || "",
                ingredients: watch("ingredients") || ""
              })}
              disabled={generateSEOMutation.isPending || !watch("name")}
              className="flex items-center gap-2 text-gold-warm text-xs tracking-[0.14em] uppercase font-sans hover:text-gold-bright transition-colors disabled:opacity-50"
            >
              {generateSEOMutation.isPending && <Loader2 size={12} className="animate-spin" />}
              Generate AI SEO
            </button>
          </div>
          <div>
            <label className={labelClass}>Meta Title</label>
            <input {...register("metaTitle")} className={inputClass} placeholder="SEO title" />
          </div>
          <div>
            <label className={labelClass}>Meta Description</label>
            <textarea
              {...register("metaDescription")}
              className={inputClass}
              rows={3}
              placeholder="SEO description"
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-4 pt-4 border-t border-[#1E1E1E]">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-gold-warm text-obsidian text-xs tracking-[0.14em] uppercase font-sans font-medium px-8 py-3 hover:bg-gold-bright transition-colors disabled:opacity-50"
        >
          {isSubmitting && <Loader2 size={14} className="animate-spin" />}
          {product ? "Save Changes" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="text-ash text-xs tracking-[0.14em] uppercase font-sans hover:text-ivory transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
