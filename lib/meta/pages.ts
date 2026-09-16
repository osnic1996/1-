import { graphGet } from "./graph-client";

export interface MetaPage {
  id: string;
  name: string;
  access_token: string;
}

export interface InstagramAccount {
  id: string;
  username?: string;
}

export async function getUserPages(userAccessToken: string): Promise<MetaPage[]> {
  const res = await graphGet<{ data: MetaPage[] }>("/me/accounts", {
    access_token: userAccessToken,
    fields: "id,name,access_token",
  });
  return res.data;
}

export async function getInstagramAccountForPage(
  pageId: string,
  pageAccessToken: string
): Promise<InstagramAccount | null> {
  const res = await graphGet<{
    instagram_business_account?: InstagramAccount;
  }>(`/${pageId}`, {
    access_token: pageAccessToken,
    fields: "instagram_business_account{id,username}",
  });
  return res.instagram_business_account ?? null;
}
