import { FinanceType } from "@/generated/prisma/client";

export const typeLabels: Record<FinanceType, string> = {
  CreditCard: "Credit card",
  TaxFiling: "Tax filing",
  ChargebackRefund: "Chargeback / refund",
  Other: "Other",
};
