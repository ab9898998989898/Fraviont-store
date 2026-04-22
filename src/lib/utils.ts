import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format integer cents to ZAR currency string.
 * e.g. 28500 → "R285.00"
 */
export function formatPrice(cents: number): string {
  const rands = cents / 100;
  return `R${rands.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

/**
 * Format a date to a human-readable string.
 * e.g. "15 Jan 2024"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Generate a unique order number.
 * e.g. "FRV-20240115-A3B2"
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `FRV-${datePart}-${randomPart}`;
}
