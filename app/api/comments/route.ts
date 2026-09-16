import { NextResponse } from "next/server";
import { fetchFacebookPageComments, fetchInstagramComments } from "@/lib/meta/comments";
import { getConnections, isConnected } from "@/lib/store/connections-store";
import { getAllStoredComments, upsertNewComments } from "@/lib/store/comments-store";
import { SAMPLE_COMMENTS } from "@/lib/sample-data";

export async function GET() {
  if (!isConnected()) {
    return NextResponse.json({ connected: false, comments: SAMPLE_COMMENTS });
  }

  const { pages } = getConnections();

  await Promise.all(
    pages.map(async (page) => {
      try {
        const fbComments = await fetchFacebookPageComments(page.pageId, page.pageAccessToken);
        upsertNewComments(fbComments);
      } catch (err) {
        console.error(`Failed to fetch Facebook comments for page ${page.pageId}`, err);
      }

      if (page.instagramAccountId) {
        try {
          const igComments = await fetchInstagramComments(
            page.instagramAccountId,
            page.pageAccessToken
          );
          upsertNewComments(igComments);
        } catch (err) {
          console.error(
            `Failed to fetch Instagram comments for account ${page.instagramAccountId}`,
            err
          );
        }
      }
    })
  );

  return NextResponse.json({ connected: true, comments: getAllStoredComments() });
}
