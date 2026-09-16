import { NextResponse } from "next/server";
import { clearConnections, getConnections } from "@/lib/store/connections-store";

// Never return access tokens to the client — only what the UI needs to
// show a "connected as ..." status.
export async function GET() {
  const { pages, connectedAt } = getConnections();
  return NextResponse.json({
    connected: pages.length > 0,
    connectedAt,
    pages: pages.map((p) => ({
      pageId: p.pageId,
      pageName: p.pageName,
      instagramUsername: p.instagramUsername,
    })),
  });
}

export async function DELETE() {
  clearConnections();
  return NextResponse.json({ ok: true });
}
