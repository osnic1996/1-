function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.local.example to .env.local and fill it in (see SETUP_META.md).`
    );
  }
  return value;
}

export const metaConfig = {
  get appId() {
    return required("META_APP_ID", process.env.META_APP_ID);
  },
  get appSecret() {
    return required("META_APP_SECRET", process.env.META_APP_SECRET);
  },
  get graphVersion() {
    return process.env.META_GRAPH_API_VERSION || "v21.0";
  },
  get webhookVerifyToken() {
    return required(
      "META_WEBHOOK_VERIFY_TOKEN",
      process.env.META_WEBHOOK_VERIFY_TOKEN
    );
  },
  get appUrl() {
    return required("NEXT_PUBLIC_APP_URL", process.env.NEXT_PUBLIC_APP_URL);
  },
};

export function isMetaConfigured(): boolean {
  return Boolean(
    process.env.META_APP_ID &&
      process.env.META_APP_SECRET &&
      process.env.NEXT_PUBLIC_APP_URL
  );
}

export const GRAPH_BASE_URL = "https://graph.facebook.com";
export const OAUTH_DIALOG_URL = "https://www.facebook.com";

export const OAUTH_SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_engagement",
  "pages_manage_metadata",
  "instagram_basic",
  "instagram_manage_comments",
].join(",");
