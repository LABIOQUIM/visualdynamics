"use server";
import { NotionAPI } from "notion-client";

const api = new NotionAPI({
  activeUser: process.env.NOTION_USER,
  authToken: process.env.NOTION_SECRET
});

export async function fetchPages() {
  return api.getPage("e48ddc6f10704530b381eda81dd3bd68");
}

export async function fetchPage(pageId: string) {
  return api.getPage(pageId);
}
