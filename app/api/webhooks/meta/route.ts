import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  FacebookFeedWebhookValue,
  InstagramWebhookValue,
  normalizeFacebookWebhookComment,
  normalizeInstagramWebhookComment,
} from "@/lib/meta/normalize";
import { upsertNewComments } from "@/lib/store/comments-store";
import { Comment } from "@/lib/types";

// Meta calls this once, at subscription time, to prove we control the
// callback URL: echo back hub.challenge only if the verify token matches
// what was configured in the app's Webhooks product.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Read the raw env var (not the throwing metaConfig getter) so an
  // unconfigured deployment fails verification cleanly instead of 500ing.
  const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && challenge && expectedToken && token === expectedToken) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

function verifySignature(rawBody: string, header: string | null): boolean {
  const appSecret = process.env.META_APP_SECRET;
  if (!header || !appSecret) return false;
  const [algo, signature] = header.split("=");
  if (algo !== "sha256" || !signature) return false;
  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody, "utf8")
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false; // length mismatch etc. -> not a match
  }
}

interface WebhookEntry {
  id: string;
  changes?: Array<{ field: string; value: Record<string, unknown> }>;
}

interface WebhookPayload {
  object: "page" | "instagram" | string;
  entry?: WebhookEntry[];
}

// Real-time delivery of new comments once a page/IG account is subscribed
// to the "feed" / "comments" fields in the Meta app dashboard.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!verifySignature(rawBody, req.headers.get("x-hub-signature-256"))) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  const newComments: Comment[] = [];

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (
        payload.object === "page" &&
        change.field === "feed" &&
        (change.value as { item?: string }).item === "comment" &&
        (change.value as { verb?: string }).verb === "add"
      ) {
        newComments.push(
          normalizeFacebookWebhookComment(
            change.value as unknown as FacebookFeedWebhookValue,
            entry.id
          )
        );
      }

      if (payload.object === "instagram" && change.field === "comments") {
        newComments.push(
          normalizeInstagramWebhookComment(
            change.value as unknown as InstagramWebhookValue,
            entry.id
          )
        );
      }
    }
  }

  const added = upsertNewComments(newComments);
  return NextResponse.json({ received: newComments.length, added });
}
