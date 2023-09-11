"use server";

import { readItem } from "@directus/sdk";
import { MDXRemoteSerializeResult } from "next-mdx-remote";

import { directusClient } from "@/lib/directus";

export interface CustomKnowledgeType extends Omit<KnowledgeType, "content"> {
  content: MDXRemoteSerializeResult<
    Record<string, unknown>,
    Record<string, unknown>
  >;
}

export async function getKnowledge(
  knowledgeId?: string
): Promise<KnowledgeType | undefined> {
  if (knowledgeId) {
    const knowledgeItem = await directusClient.request(
      readItem("Knowledge", knowledgeId, {
        fields: [
          "*",
          { user_created: ["first_name"], user_updated: ["first_name"] }
        ]
      })
    );

    if (knowledgeItem) {
      return knowledgeItem;
    }

    return undefined;
  }
}
