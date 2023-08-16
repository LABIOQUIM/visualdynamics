import { allPosts } from "contentlayer/generated";
import useTranslation from "next-translate/useTranslation";

import { PageLayout } from "aold/components/general/page-layout";
import { H1 } from "aold/components/general/typography/headings";
import BlogCard from "aold/components/posts/list/item";
import { SEO } from "aold/components/seo";

export default function Blog() {
  const { t } = useTranslation();

  return (
    <PageLayout>
      <SEO title={t("navigation:system.posts.title")} />
      <H1>{t("navigation:system.posts.title")}</H1>
      <div className="grid grid-cols-1 gap-2">
        {allPosts
          .filter((p) =>
            process.env.NODE_ENV === "development"
              ? true
              : p.status === "published"
          )
          .map((p) => (
            <BlogCard
              key={p.title}
              {...p}
            />
          ))}
      </div>
    </PageLayout>
  );
}
