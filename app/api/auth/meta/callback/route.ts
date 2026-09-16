import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, exchangeForLongLivedToken } from "@/lib/meta/oauth";
import { getInstagramAccountForPage, getUserPages } from "@/lib/meta/pages";
import { PageConnection, saveConnections } from "@/lib/store/connections-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieState = req.cookies.get("meta_oauth_state")?.value;

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(new URL("/?meta_error=invalid_state", req.url));
  }

  try {
    const shortLived = await exchangeCodeForToken(code);
    const longLived = await exchangeForLongLivedToken(shortLived.access_token);
    const pages = await getUserPages(longLived.access_token);

    const connections: PageConnection[] = [];
    for (const page of pages) {
      const ig = await getInstagramAccountForPage(page.id, page.access_token);
      connections.push({
        pageId: page.id,
        pageName: page.name,
        pageAccessToken: page.access_token,
        instagramAccountId: ig?.id,
        instagramUsername: ig?.username,
      });
    }

    saveConnections(connections);

    const res = NextResponse.redirect(new URL("/?connected=1", req.url));
    res.cookies.delete("meta_oauth_state");
    return res;
  } catch (err) {
    console.error("Meta OAuth callback failed", err);
    return NextResponse.redirect(new URL("/?meta_error=oauth_failed", req.url));
  }
}
