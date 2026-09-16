import { GRAPH_BASE_URL, metaConfig } from "./config";

export class GraphApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: unknown
  ) {
    super(message);
    this.name = "GraphApiError";
  }
}

function url(path: string, params: Record<string, string | undefined>) {
  const u = new URL(`${GRAPH_BASE_URL}/${metaConfig.graphVersion}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) u.searchParams.set(key, value);
  }
  return u.toString();
}

async function request<T>(
  method: "GET" | "POST" | "DELETE",
  path: string,
  params: Record<string, string | undefined> = {}
): Promise<T> {
  const res = await fetch(url(path, params), { method });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (body as { error?: { message?: string } })?.error?.message ||
      `Graph API request failed (${res.status})`;
    throw new GraphApiError(message, res.status, body);
  }
  return body as T;
}

export const graphGet = <T>(
  path: string,
  params: Record<string, string | undefined> = {}
) => request<T>("GET", path, params);

export const graphPost = <T>(
  path: string,
  params: Record<string, string | undefined> = {}
) => request<T>("POST", path, params);

export const graphDelete = <T>(
  path: string,
  params: Record<string, string | undefined> = {}
) => request<T>("DELETE", path, params);
