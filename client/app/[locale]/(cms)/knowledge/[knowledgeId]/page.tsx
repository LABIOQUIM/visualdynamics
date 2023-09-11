"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";

import {
  CustomKnowledgeType,
  getKnowledge
} from "@/app/[locale]/(cms)/knowledge/[knowledgeId]/getKnowledge";
import { PageLayout } from "@/components/Layouts/PageLayout";
import { Spinner } from "@/components/LoadingIndicators/Spinner";
import { H1, H2 } from "@/components/Typography";

export default function Page() {
  const { knowledgeId } = useParams();
  const [knowledge, setKnowledge] = useState<CustomKnowledgeType>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setKnowledge(undefined);
    setIsLoading(true);
    getKnowledge(String(knowledgeId))
      .then(async (k) => {
        if (k) {
          setKnowledge({
            ...k,
            content: await serialize(k.content, {
              mdxOptions: {
                development: process.env.NODE_ENV === "development"
              }
            })
          });
        }
      })
      .finally(() => setIsLoading(false));
  }, [knowledgeId]);

  if (isLoading) {
    return (
      <PageLayout className="items-center justify-center">
        <Spinner />
      </PageLayout>
    );
  }

  if (!knowledge) {
    return <PageLayout>Not Found</PageLayout>;
  }

  return (
    <PageLayout>
      <H1>{knowledge.title}</H1>
      <MDXRemote
        components={{
          // @ts-ignore
          h1: (props) => <H2 {...props} />,
          // @ts-ignore
          h2: (props) => <H2 {...props} />
        }}
        {...knowledge.content}
      />
    </PageLayout>
  );
}
