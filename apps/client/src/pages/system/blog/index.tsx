import { allPosts } from "contentlayer/generated";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import BlogCard from "@app/components/BlogCard";
import { PageLayout } from "@app/components/Layout/Page";

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en-US", ["navigation"]))
    }
  };
};

export default function Blog() {
  return (
    <PageLayout title="Blog">
      <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-2 sm:grid-cols-2">
        {allPosts
          // .filter((p) => p.status === "published")
          .map((p: PostProps) => (
            <BlogCard
              key={p.title}
              {...p}
            />
          ))}
      </div>
    </PageLayout>
  );
}
