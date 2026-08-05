import { Domain, Priority, TaskStatus } from "@prisma/client";

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

export const domainColors: Record<Domain, string> = {
  Sourcing: "#D89A6E",
  Logistics: "#E6C784",
  CustomerService: "#7FA084",
  Marketing: "#7FC9BE",
  Finance: "#8FAFC9",
  General: "#9A968C",
};

export const priorityColors: Record<Priority, string> = {
  Urgent: "#D89A6E",
  High: "#E6C784",
  Medium: "#7FA084",
  Low: "rgba(251,249,243,0.4)",
};

export const statusColors: Record<TaskStatus, string> = {
  NotStarted: "rgba(251,249,243,0.35)",
  InProgress: "#E6C784",
  Blocked: "#D89A6E",
  Done: "#7FA084",
};
