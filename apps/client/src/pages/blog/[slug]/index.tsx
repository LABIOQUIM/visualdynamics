import { allPosts } from "contentlayer/generated";
import { Calendar, Clock } from "lucide-react";
import { useRouter } from "next/router";
import { useMDXComponent } from "next-contentlayer/hooks";
import { useTranslation } from "next-i18next";

import { components } from "@app/components/MDX/MDXComponents";
import { withSSRTranslations } from "@app/hocs/withSSRTranslations";

export const getServerSideProps = withSSRTranslations(async ({ params }) => {
  return {
    props: {
      post: allPosts.find((p) => p.slug === params?.slug)
    }
  };
});

export default function BlogPost({ post }: { post: PostProps }) {
  const { t } = useTranslation(["common"]);
  const MDXContent = useMDXComponent(post ? post.body.code : "");
  const router = useRouter();

  return (
    <div>
      <h2 className="text-xl font-bold md:text-4xl">{post?.title}</h2>
      <div className="flex flex-col md:flex-row gap-4 my-2.5">
        <p className="flex items-center gap-x-1 text-sm font-medium text-gray-500 md:text-lg">
          <Clock className="h-5 w-5" />
          {t("common:blog.readtime", {
            minutes: Math.round(post?.readingTime.minutes)
          })}
        </p>
        <p className="flex items-center gap-x-1 text-sm font-medium text-gray-500 md:text-lg">
          <Calendar className="h-5 w-5" />
          {Intl.DateTimeFormat(router.locale, {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }).format(new Date(post?.publishedAt ?? ""))}
        </p>
      </div>
      <p className="text-base font-medium italic tracking-tighter text-gray-600 dark:text-gray-400 md:text-lg">
        {post?.description}
      </p>

      <div className="mt-10 grid text-gray-800 dark:text-gray-200">
        <MDXContent
          components={{
            ...components
          }}
        />
      </div>
    </div>
  );
}
