import { Comment } from "@/lib/types";
import { graphDelete, graphGet, graphPost } from "./graph-client";
import { normalizeFacebookComment, normalizeInstagramComment } from "./normalize";

interface FbPostWithComments {
  id: string;
  permalink_url?: string;
  comments?: {
    data: Array<{
      id: string;
      message?: string;
      from?: { id: string; name: string };
      created_time: string;
      permalink_url?: string;
    }>;
  };
}

// Pulls the page's most recent posts (default 10) and every comment on
// each, newest posts first. Good enough for a dashboard preview; a
// production version would page through /comments with `after` cursors.
export async function fetchFacebookPageComments(
  pageId: string,
  pageAccessToken: string,
  postLimit = 10
): Promise<Comment[]> {
  const res = await graphGet<{ data: FbPostWithComments[] }>(`/${pageId}/posts`, {
    access_token: pageAccessToken,
    fields: "id,permalink_url,comments.limit(50){id,message,from,created_time,permalink_url}",
    limit: String(postLimit),
  });

  const comments: Comment[] = [];
  for (const post of res.data) {
    for (const raw of post.comments?.data ?? []) {
      comments.push(normalizeFacebookComment(raw, pageId, post.id));
    }
  }
  return comments;
}

interface IgMediaWithComments {
  id: string;
  permalink?: string;
  comments?: {
    data: Array<{ id: string; text?: string; username?: string; timestamp: string }>;
  };
}

export async function fetchInstagramComments(
  igAccountId: string,
  accessToken: string,
  mediaLimit = 10
): Promise<Comment[]> {
  const res = await graphGet<{ data: IgMediaWithComments[] }>(`/${igAccountId}/media`, {
    access_token: accessToken,
    fields: "id,permalink,comments.limit(50){id,text,username,timestamp}",
    limit: String(mediaLimit),
  });

  const comments: Comment[] = [];
  for (const media of res.data) {
    for (const raw of media.comments?.data ?? []) {
      comments.push(
        normalizeInstagramComment(raw, igAccountId, media.id, media.permalink)
      );
    }
  }
  return comments;
}

// `hide=true` toggles visibility without deleting — used for "AI 자동
// 제외" so the action is reversible. Works for both FB and IG comment ids.
export function hideComment(graphId: string, accessToken: string, hide: boolean) {
  return graphPost(`/${graphId}`, {
    access_token: accessToken,
    hide: String(hide),
  });
}

// Permanent. Used for the explicit "삭제" bulk action only.
export function deleteComment(graphId: string, accessToken: string) {
  return graphDelete(`/${graphId}`, { access_token: accessToken });
}

export function replyToComment(
  graphId: string,
  accessToken: string,
  message: string
) {
  return graphPost(`/${graphId}/comments`, {
    access_token: accessToken,
    message,
  });
}
