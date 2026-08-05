import { Platform, PostType, PostStatus } from "@prisma/client";

export const platformLabels: Record<Platform, string> = {
  Instagram: "Instagram",
  TikTok: "TikTok",
  Both: "Both",
};

export const typeLabels: Record<PostType, string> = {
  Reel: "Reel",
  StaticPost: "Static post",
  Story: "Story",
  UGCRepost: "UGC repost",
};

export const statusLabels: Record<PostStatus, string> = {
  Idea: "Idea",
  Scripted: "Scripted",
  Filmed: "Filmed",
  Edited: "Edited",
  Scheduled: "Scheduled",
  Posted: "Posted",
};

export const platformColors: Record<Platform, string> = {
  Instagram: "#C97F94",
  TikTok: "#7FC9BE",
  Both: "#B98FC9",
};
