import { allPosts } from "contentlayer/generated";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";

import { PageLayout } from "@app/components/general/page-layout";
import { H1 } from "@app/components/general/typography/headings";
import BlogCard from "@app/components/posts/list/item";
import { SEO } from "@app/components/seo";

export default function Blog() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <PageLayout>
      <SEO title={t("navigation:system.posts.title")} />
      <H1>{t("navigation:system.posts.title")}</H1>
      <div className="grid grid-cols-1 gap-2">
        {allPosts
          .filter((p) => p.locale === router.locale)
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
