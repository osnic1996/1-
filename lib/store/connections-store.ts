import { readJson, writeJson } from "./file-store";

export interface PageConnection {
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  instagramAccountId?: string;
  instagramUsername?: string;
}

interface ConnectionsFile {
  pages: PageConnection[];
  connectedAt?: string;
}

const FILE = "meta-connections.json";
const EMPTY: ConnectionsFile = { pages: [] };

export function getConnections(): ConnectionsFile {
  return readJson(FILE, EMPTY);
}

export function isConnected(): boolean {
  return getConnections().pages.length > 0;
}

export function saveConnections(pages: PageConnection[]) {
  writeJson<ConnectionsFile>(FILE, { pages, connectedAt: new Date().toISOString() });
}

export function findPageByGraphContext(pageOrIgAccountId: string): PageConnection | undefined {
  const { pages } = getConnections();
  return pages.find(
    (p) => p.pageId === pageOrIgAccountId || p.instagramAccountId === pageOrIgAccountId
  );
}

export function clearConnections() {
  writeJson<ConnectionsFile>(FILE, EMPTY);
}
