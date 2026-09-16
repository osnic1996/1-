import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { buildLoginUrl } from "@/lib/meta/oauth";

// Starts the Facebook Login flow: redirects to Meta's OAuth dialog with a
// random `state` value stashed in a short-lived cookie, checked again in
// the callback to guard against CSRF.
export async function GET(req: Request) {
  try {
    const state = crypto.randomBytes(16).toString("hex");
    const res = NextResponse.redirect(buildLoginUrl(state));
    res.cookies.set("meta_oauth_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("Failed to start Meta OAuth", err);
    return NextResponse.redirect(
      new URL("/?meta_error=not_configured", req.url)
    );
  }
}
