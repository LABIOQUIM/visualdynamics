import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { getPageTitle } from "notion-utils";

import { PageLayout } from "@/components/Layouts/PageLayout";
import { fetchPage } from "@/lib/notion";

const NotionPage = dynamic(() => import("@/components/NotionPage"), {
  ssr: false
});

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}) {
  const data = await fetchPage(params.slug);

  const title = getPageTitle(data);

  if (title === "Docs") {
    return;
  }

  return {
    title
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const post = await fetchPage(params.slug);

  if (!post) notFound();

  return (
    <PageLayout className="container mx-auto">
      <NotionPage recordMap={post} />;
    </PageLayout>
  );
}
