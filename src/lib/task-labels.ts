import { Domain, Priority, TaskStatus } from "@/generated/prisma/client";

export const domainLabels: Record<Domain, string> = {
  Sourcing: "Sourcing",
  Logistics: "Logistics",
  CustomerService: "Customer Service",
  Marketing: "Marketing",
  Finance: "Finance",
  General: "General",
};

export const statusLabels: Record<TaskStatus, string> = {
  NotStarted: "Not Started",
  InProgress: "In Progress",
  Blocked: "Blocked",
  Done: "Done",
};

export const priorityLabels: Record<Priority, string> = {
  Low: "Low",
  Medium: "Medium",
  High: "High",
  Urgent: "Urgent",
};

export const priorityOrder: Record<Priority, number> = {
  Urgent: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};
