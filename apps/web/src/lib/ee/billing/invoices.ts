import "server-only";

import { stripe } from "./stripe";

export interface InvoiceLineItem {
  amount: number;
  description: null | string;
}

export interface BillingInvoice {
  amountDue: number;
  currency: string;
  date: Date;
  hostedUrl: null | string;
  id: string;
  lineItems: InvoiceLineItem[];
  number: null | string;
  pdfUrl: null | string;
  status: "draft" | "open" | "paid" | "uncollectible" | "void";
}

/**
 * List invoices for a Stripe customer with line item details.
 */
export async function listInvoices(customerId: null | string, limit = 12): Promise<BillingInvoice[]> {
  if (!stripe || !customerId) return [];

  const response = await stripe.invoices.list({
    customer: customerId,
    limit,
    expand: ["data.lines.data"],
  });

  return response.data.map(invoice => ({
    amountDue: invoice.amount_due,
    currency: invoice.currency,
    date: new Date((invoice.created ?? 0) * 1000),
    hostedUrl: invoice.hosted_invoice_url ?? null,
    id: invoice.id,
    lineItems: (invoice.lines?.data ?? []).map(line => ({
      amount: line.amount,
      description: line.description,
    })),
    number: invoice.number,
    pdfUrl: invoice.invoice_pdf ?? null,
    status: (invoice.status ?? "draft") as BillingInvoice["status"],
  }));
}
