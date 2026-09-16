import { Comment } from "@/lib/types";
import { readJson, writeJson } from "./file-store";

const FILE = "comments-cache.json";

type CommentMap = Record<string, Comment>;

function load(): CommentMap {
  return readJson<CommentMap>(FILE, {});
}

function save(map: CommentMap) {
  writeJson(FILE, map);
}

export function getAllStoredComments(): Comment[] {
  return Object.values(load()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// Adds comments the cache hasn't seen yet. Existing rows are left alone
// so a re-fetch never clobbers a human's triage decision (status,
// category, reviewTag) with the "unreviewed" default a fresh normalize
// would produce.
export function upsertNewComments(incoming: Comment[]) {
  const map = load();
  let added = 0;
  for (const c of incoming) {
    if (!map[c.id]) {
      map[c.id] = c;
      added += 1;
    }
  }
  if (added > 0) save(map);
  return added;
}

export function patchComment(id: string, patch: Partial<Comment>) {
  const map = load();
  if (!map[id]) return null;
  map[id] = { ...map[id], ...patch };
  save(map);
  return map[id];
}

export function removeComment(id: string) {
  const map = load();
  delete map[id];
  save(map);
}

export function getComment(id: string): Comment | undefined {
  return load()[id];
}
