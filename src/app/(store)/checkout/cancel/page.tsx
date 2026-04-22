import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-8 flex flex-col items-center justify-center text-center">
      <div className="max-w-md space-y-6">
        <h1 className="font-display text-ivory font-light text-4xl">
          Payment Cancelled
        </h1>
        <p className="text-parchment font-sans font-light text-base leading-relaxed">
          Your payment was cancelled. Your cart has been saved and you can
          complete your order at any time.
        </p>
        <Link
          href="/checkout"
          className="inline-block bg-transparent text-gold-warm text-xs tracking-[0.14em] uppercase font-sans font-medium px-10 py-4 border border-gold-warm hover:bg-gold-warm hover:text-obsidian transition-colors duration-300"
        >
          Return to Cart
        </Link>
      </div>
    </div>
  );
}
