import { allPosts } from "contentlayer/generated";

import BlogCard from "@app/components/BlogCard";
import { HeaderSEO } from "@app/components/Layout/HeaderSEO";
import { PageTitle } from "@app/components/PageTitle";

export default function Home() {
  return (
    <>
      <HeaderSEO title="Blog" />
      <PageTitle title="Blog" />
      <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-2 sm:grid-cols-2">
        {allPosts
          .filter((p) => p.status === "published")
          .map((p: PostProps) => (
            <BlogCard
              key={p.title}
              {...p}
            />
          ))}
      </div>
    </>
  );
}
