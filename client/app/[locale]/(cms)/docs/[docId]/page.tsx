"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";

import {
  CustomDocumentType,
  getDoc
} from "@/app/[locale]/(cms)/docs/[docId]/getDoc";
import { PageLayout } from "@/components/Layouts/PageLayout";
import { Spinner } from "@/components/LoadingIndicators/Spinner";
import { H1, H2 } from "@/components/Typography";

export default function Page() {
  const { docId } = useParams();
  const [doc, setDoc] = useState<CustomDocumentType>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setDoc(undefined);
    setIsLoading(true);
    getDoc(String(docId))
      .then(async (doc) => {
        if (doc) {
          setDoc({
            ...doc,
            content: await serialize(doc.content, {
              mdxOptions: {
                development: process.env.NODE_ENV === "development"
              }
            })
          });
        }
      })
      .finally(() => setIsLoading(false));
  }, [docId]);

  if (isLoading) {
    return (
      <PageLayout className="items-center justify-center">
        <Spinner />
      </PageLayout>
    );
  }

  if (!doc) {
    return <PageLayout>Not Found</PageLayout>;
  }

  return (
    <PageLayout>
      <H1>{doc.title}</H1>
      <MDXRemote
        components={{
          // @ts-ignore
          h1: (props) => <H2 {...props} />,
          // @ts-ignore
          h2: (props) => <H2 {...props} />
        }}
        {...doc.content}
      />
    </PageLayout>
  );
}
