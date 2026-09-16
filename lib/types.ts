export type Platform = "instagram" | "facebook";

export type CommentStatus =
  | "unreviewed" // 미검토
  | "pending" // 판단 보류
  | "ai_excluded" // AI 자동 제외
  | "completed"; // 처리 완료

export type Category = "광고" | "스팸" | "문의" | "칭찬" | "불만" | "기타";

export type ReviewTag = "신규" | "맥락 확인" | "검토" | "AI 제외" | "스팸 의심";

export interface Comment {
  id: string;
  status: CommentStatus;
  platform: Platform;
  username: string;
  timestamp: string; // ISO timestamp, used for sorting
  timestampLabel: string; // display label, e.g. "9. 16. 07:17"
  content: string;
  note: string; // gray description line under content
  sourceTag: string;
  hasOriginal: boolean;
  category: Category;
  reviewTag: ReviewTag;

  // Present only for comments backed by a real Meta Graph API object.
  // Absent for sample/demo data.
  source?: "meta";
  graphId?: string; // Facebook/Instagram comment id, used for moderation calls
  pageId?: string; // owning Facebook Page id (token lookup key)
  permalink?: string; // real link to the original comment/post
  hidden?: boolean; // whether the comment is currently hidden on Meta's side
}

export const STATUS_LABELS: Record<CommentStatus, string> = {
  unreviewed: "미검토",
  pending: "판단 보류",
  ai_excluded: "AI 자동 제외",
  completed: "처리 완료",
};

export const CATEGORY_LABELS: Category[] = [
  "광고",
  "스팸",
  "문의",
  "칭찬",
  "불만",
  "기타",
];
