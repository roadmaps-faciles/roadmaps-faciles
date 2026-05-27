/**
 * Pricing types and formatting utilities - client-safe (no server-only).
 */

export interface PricingInfo {
  currency: string;
  monthly: number;
  yearly: number;
}

/**
 * Format a price in cents to a human-readable string (e.g. "29,00 €").
 */
export function formatPrice(amountCents: number, currency: string, locale = "fr-FR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amountCents / 100);
}
