import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "Fraviont — Luxury Perfumes, Cosmetics & Jewelry",
  description: "Discover the art of presence. Luxury perfumes, cosmetics, and jewelry.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div
          id="page-curtain"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "#C9A84C",
            transform: "scaleY(0)",
            transformOrigin: "bottom",
            pointerEvents: "none",
          }}
        />
        <TRPCReactProvider>
          {children}
        </TRPCReactProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1E1E1E",
              color: "#F5F0E8",
              border: "1px solid #2A2A2A",
              borderRadius: "0",
              fontFamily: "Jost, sans-serif",
              fontSize: "0.875rem",
            },
          }}
        />
      </body>
    </html>
  );
}
