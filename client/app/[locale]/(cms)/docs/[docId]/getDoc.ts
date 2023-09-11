"use server";

import { readItem } from "@directus/sdk";
import { MDXRemoteSerializeResult } from "next-mdx-remote";

import { directusClient } from "@/lib/directus";

export interface CustomDocumentType extends Omit<DocumentationType, "content"> {
  content: MDXRemoteSerializeResult<
    Record<string, unknown>,
    Record<string, unknown>
  >;
}

export async function getDoc(
  docId?: string
): Promise<DocumentationType | undefined> {
  if (docId) {
    const docItem = await directusClient.request(
      readItem("Documentation", docId, {
        fields: [
          "*",
          { user_created: ["first_name"], user_updated: ["first_name"] }
        ]
      })
    );

    if (docItem) {
      return docItem;
    }

    return undefined;
  }
}
