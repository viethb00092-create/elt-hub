export type IconName =
  | "arrow"
  | "book"
  | "check"
  | "chevron"
  | "close"
  | "download"
  | "heart"
  | "menu"
  | "search"
  | "sparkle"
  | "users";

export type UserRole = "admin" | "member";

export type User = {
  uid: string;
  email: string;
  name: string;
  initials: string;
  role: UserRole;
};

export type ArticleLayout = "standard" | "zigzag";

export type ArticleSection = {
  heading: string;
  body: string;
  image?: string;
  caption?: string;
  videoUrl?: string;
};

export type ResourceStatus = "approved" | "pending";

export type Resource = {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  author: string;
  initials: string;
  color: string;
  image: string;
  downloads: string;
  downloadCount?: number;
  attachmentUrl?: string;
  attachmentName?: string;
  status?: ResourceStatus;
  submittedByUid?: string;
  publishedAt: string;
  createdAtMs?: number;
  layout?: ArticleLayout;
  videoUrl?: string;
  sections: ArticleSection[];
};

export type TheoryModule = {
  id: string;
  title: string;
  label: string;
  text: string;
  author: string;
  initials: string;
  color: string;
  publishedAt: string;
  createdAtMs?: number;
  image: string;
  layout?: ArticleLayout;
  videoUrl?: string;
  sections: ArticleSection[];
};

export type Comment = {
  id: string;
  author: string;
  initials: string;
  color: string;
  content: string;
  createdAt: string;
  upvotes: number;
  upvotedBy: string[];
};

export type Discussion = {
  id: string;
  title: string;
  content: string;
  author: string;
  initials: string;
  color: string;
  category: string;
  createdAt: string;
  createdAtMs?: number;
  upvotes: number;
  upvotedBy: string[];
  comments: Comment[];
};

export type ToolId =
  | "gameshow"
  | "wheel"
  | "bingo"
  | "quiz"
  | "scramble"
  | "exit-ticket"
  | "worksheet";

export type ToolItem = {
  id: ToolId;
  title: string;
  description: string;
  badge: string;
  themeClass: string;
};

export type ToolDeck = {
  id: string;
  ownerUid: string;
  ownerName: string;
  toolId: ToolId;
  title: string;
  rawInput: string;
  bingoSize?: 3 | 4;
  updatedAt: string;
  updatedAtMs: number;
};