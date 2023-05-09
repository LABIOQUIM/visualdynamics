import { allPosts } from "contentlayer/generated";
import { useRouter } from "next/router";

import BlogCard from "@app/components/Post/Card";
import { withSPTranslations } from "@app/hocs/withSPTranslations";

export const getStaticProps = withSPTranslations();

export default function Blog() {
  const router = useRouter();

  return (
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
  );
}
