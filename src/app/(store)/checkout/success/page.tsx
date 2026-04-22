import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-8 flex flex-col items-center justify-center text-center">
      <div className="max-w-md space-y-6">
        <div className="w-12 h-12 border border-gold-warm flex items-center justify-center mx-auto">
          <span className="text-gold-warm text-xl">✓</span>
        </div>
        <h1 className="font-display text-ivory font-light text-4xl">
          Order Confirmed
        </h1>
        <p className="text-parchment font-sans font-light text-base leading-relaxed">
          Thank you for your order. You will receive a confirmation email
          shortly. Your order will be delivered within 3–5 business days.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-gold-warm text-obsidian text-xs tracking-[0.14em] uppercase font-sans font-medium px-10 py-4 hover:bg-gold-bright transition-colors duration-300"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
