import { NextRequest, NextResponse } from "next/server";
import { deleteComment, hideComment } from "@/lib/meta/comments";
import { findPageByGraphContext } from "@/lib/store/connections-store";
import { getComment, patchComment, removeComment } from "@/lib/store/comments-store";
import { CommentStatus } from "@/lib/types";

interface BulkMoveBody {
  action: "move";
  ids: string[];
  targetStatus: CommentStatus;
}

interface BulkDeleteBody {
  action: "delete";
  ids: string[];
}

type BulkBody = BulkMoveBody | BulkDeleteBody;

// Mirrors a triage decision made in the dashboard onto the real comment
// when it's backed by Meta: "AI 자동 제외" hides it (reversible), moving
// it back out un-hides it, and the explicit "삭제" action deletes it for
// good. Sample/demo rows (no `source: "meta"`) only ever touch the local
// cache since there's nothing on Meta's side to change.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as BulkBody;

  if (!body.ids?.length) {
    return NextResponse.json({ error: "ids required" }, { status: 400 });
  }

  const results = await Promise.allSettled(
    body.ids.map((id) => applyOne(id, body))
  );

  const failures = results.filter((r) => r.status === "rejected");
  if (failures.length > 0) {
    console.error("Bulk comment action had failures", failures);
  }

  return NextResponse.json({
    succeeded: results.length - failures.length,
    failed: failures.length,
  });
}

async function applyOne(id: string, body: BulkBody) {
  const comment = getComment(id);

  if (body.action === "delete") {
    if (comment?.source === "meta" && comment.graphId && comment.pageId) {
      const conn = findPageByGraphContext(comment.pageId);
      if (conn) await deleteComment(comment.graphId, conn.pageAccessToken);
    }
    removeComment(id);
    return;
  }

  // action === "move"
  if (comment?.source === "meta" && comment.graphId && comment.pageId) {
    const conn = findPageByGraphContext(comment.pageId);
    if (conn) {
      const shouldHide = body.targetStatus === "ai_excluded";
      const wasHidden = Boolean(comment.hidden);
      if (shouldHide !== wasHidden) {
        await hideComment(comment.graphId, conn.pageAccessToken, shouldHide);
        patchComment(id, { hidden: shouldHide });
      }
    }
  }
  patchComment(id, { status: body.targetStatus });
}
