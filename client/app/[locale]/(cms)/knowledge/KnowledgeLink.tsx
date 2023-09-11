"use client";

import { Clock, User } from "lucide-react";
import Link from "next/link";

import { H2, ParagraphSmall } from "@/components/Typography";
import { dateFormat } from "@/utils/dateFormat";

interface Props {
  knowledge: Partial<KnowledgeType>;
}

export function KnowledgeLink({ knowledge }: Props) {
  return (
    <Link
      as={`/knowledge/${knowledge.id}`}
      className="w-full rounded-lg bg-primary-950/10 p-2 hover:opacity-80 dark:bg-primary-50/5"
      href={`/knowledge/${knowledge.id}`}
      key={knowledge.id}
    >
      <H2>{knowledge.title}</H2>
      <div className="flex gap-4">
        <ParagraphSmall className="flex items-center gap-2 opacity-70">
          <Clock className="h-4 w-4" />
          {dateFormat(
            new Date(knowledge.date_updated ?? knowledge.date_created ?? 0)
          )}
        </ParagraphSmall>
        <ParagraphSmall className="flex items-center gap-2 opacity-70">
          <User className="h-4 w-4" />
          {knowledge.user_updated?.first_name ??
            knowledge.user_created?.first_name ??
            "Unknown"}
        </ParagraphSmall>
      </div>
    </Link>
  );
}
