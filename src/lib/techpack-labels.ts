import { TechpackCategory, TechpackStatus } from "@prisma/client";

export const categoryLabels: Record<TechpackCategory, string> = {
  Pants: "Pants",
  Beanie: "Beanie",
  Thermal: "Thermal",
  Midlayer: "Midlayer",
  Hat: "Hat",
  Other: "Other",
};

export const statusLabels: Record<TechpackStatus, string> = {
  Draft: "Draft",
  Active: "Active",
  UnderRevision: "Under revision",
  Discontinued: "Discontinued",
};
