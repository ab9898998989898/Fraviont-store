import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { api } from "@/trpc/server";
import { ProductForm } from "@/components/admin/ProductForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function ProductEditContent({ productId }: { productId: string }) {
  const product = await api.products.getById({ id: productId });

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-ivory font-sans text-lg">Product not found</p>
        <Link
          href="/admin/products"
          className="text-gold-warm text-xs tracking-[0.14em] uppercase font-sans hover:text-gold-bright transition-colors rounded-none"
        >
          ← Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-ivory font-light text-3xl mb-8">Edit Product</h2>
      <ProductForm product={product} />
    </div>
  );
}

export default async function ProductEditPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-ash font-sans text-sm">Loading...</div>
        </div>
      }
    >
      <ProductEditContent productId={id} />
    </Suspense>
  );
}
