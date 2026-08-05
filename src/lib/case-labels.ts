import { CaseIssue, CaseResolution, CaseStatus } from "@prisma/client";

export const issueLabels: Record<CaseIssue, string> = {
  DelayedShipment: "Delayed shipment",
  ProductDefect: "Product defect",
  RefundRequest: "Refund request",
  Other: "Other",
};

export const resolutionLabels: Record<CaseResolution, string> = {
  Pending: "Pending",
  FreeItem: "Free item",
  DiscountCode: "Discount code",
  Refund: "Refund",
  Replacement: "Replacement",
};

export const statusLabels: Record<CaseStatus, string> = {
  Open: "Open",
  Resolved: "Resolved",
  Escalated: "Escalated",
};
