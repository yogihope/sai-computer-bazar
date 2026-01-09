import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Consistent price formatting for SSR/CSR (Indian format)
export function formatPrice(price: number): string {
  return price.toLocaleString('en-IN');
}

// Format as currency with symbol
export function formatCurrency(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`;
}
