import { Comment } from "@/lib/types";
import { formatTimestampLabel } from "./format";

interface FacebookRawComment {
  id: string;
  message?: string;
  from?: { id: string; name: string };
  created_time: string;
  permalink_url?: string;
}

interface InstagramRawComment {
  id: string;
  text?: string;
  username?: string;
  timestamp: string;
}

// Builds a fresh, unreviewed dashboard row for a newly-seen Meta comment.
// Existing rows keep their triage state — see lib/store/comments-store.ts,
// which only calls this for ids it hasn't stored yet.
function baseComment(
  platform: Comment["platform"],
  graphId: string,
  pageId: string,
  createdIso: string,
  content: string,
  username: string,
  sourceTag: string,
  permalink: string | undefined
): Comment {
  return {
    id: `meta_${graphId}`,
    status: "unreviewed",
    platform,
    username,
    timestamp: createdIso,
    timestampLabel: formatTimestampLabel(createdIso),
    content: content || "(내용 없음)",
    note: "",
    sourceTag,
    hasOriginal: true,
    category: "기타",
    reviewTag: "신규",
    source: "meta",
    graphId,
    pageId,
    permalink,
  };
}

export function normalizeFacebookComment(
  raw: FacebookRawComment,
  pageId: string,
  postId: string
): Comment {
  return baseComment(
    "facebook",
    raw.id,
    pageId,
    raw.created_time,
    raw.message ?? "",
    raw.from?.name ?? "알 수 없음",
    `fb_${pageId}_${postId}`,
    raw.permalink_url
  );
}

export function normalizeInstagramComment(
  raw: InstagramRawComment,
  igAccountId: string,
  mediaId: string,
  mediaPermalink: string | undefined
): Comment {
  return baseComment(
    "instagram",
    raw.id,
    igAccountId,
    raw.timestamp,
    raw.text ?? "",
    raw.username ?? "알 수 없음",
    `ig_${igAccountId}_${mediaId}`,
    mediaPermalink
  );
}

// -- Webhook payload shapes differ from the REST list-fetch shapes above. --

export interface FacebookFeedWebhookValue {
  item: string;
  comment_id: string;
  post_id: string;
  sender_id?: string;
  sender_name?: string;
  message?: string;
  created_time: number; // unix seconds
  verb: string;
}

export function normalizeFacebookWebhookComment(
  value: FacebookFeedWebhookValue,
  pageId: string
): Comment {
  const createdIso = new Date(value.created_time * 1000).toISOString();
  return baseComment(
    "facebook",
    value.comment_id,
    pageId,
    createdIso,
    value.message ?? "",
    value.sender_name ?? "알 수 없음",
    `fb_${pageId}_${value.post_id}`,
    undefined
  );
}

export interface InstagramWebhookValue {
  id: string;
  text?: string;
  from?: { id: string; username?: string };
  media?: { id: string };
}

export function normalizeInstagramWebhookComment(
  value: InstagramWebhookValue,
  igAccountId: string
): Comment {
  const createdIso = new Date().toISOString();
  return baseComment(
    "instagram",
    value.id,
    igAccountId,
    createdIso,
    value.text ?? "",
    value.from?.username ?? "알 수 없음",
    `ig_${igAccountId}_${value.media?.id ?? "unknown"}`,
    undefined
  );
}
