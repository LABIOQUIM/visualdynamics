import { allPosts, Post } from "contentlayer/generated";
import { Calendar, Clock } from "lucide-react";
import { GetStaticPaths } from "next";
import { useRouter } from "next/router";
import { useMDXComponent } from "next-contentlayer/hooks";
import { useTranslation } from "next-i18next";

import { BlurImage } from "@app/components/BlurImage";
import { components } from "@app/components/Post/MDX/MDXComponents";
import { SEO } from "@app/components/SEO";
import { withSPTranslations } from "@app/hocs/withSPTranslations";

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = allPosts.map((p) => ({
    params: { slug: p.slug },
    locale: p.locale
  }));

  return {
    paths,
    fallback: false
  };
};

export const getStaticProps = withSPTranslations(async ({ params }) => {
  return {
    props: {
      post: allPosts.find((p) => p.slug === params?.slug)
    }
  };
});

export default function BlogPost({ post }: { post: Post }) {
  const { t } = useTranslation(["common"]);
  const MDXContent = useMDXComponent(post ? post.body.code : "");
  const router = useRouter();

  return (
    <>
      <SEO title={post.title} />
      <h2 className="text-xl font-bold md:text-4xl">{post?.title}</h2>
      <div className="my-2.5 flex flex-col items-center gap-4 text-gray-500 md:flex-row">
        <div className="flex w-fit gap-x-2">
          <BlurImage
            className="h-6 w-6 rounded-full"
            alt={post.author}
            src={post.authorImage}
            width={0}
            height={0}
            unoptimized
          />
          <p>{post.author}</p>
        </div>
        <p className="flex items-center gap-x-2 text-sm font-medium md:text-lg">
          <Clock className="m-auto h-4 w-4 text-zinc-300" />
          {t("common:blog.readtime", {
            minutes: Math.round(post?.readingTime.minutes)
          })}
        </p>
        <p className="flex items-center gap-x-2 text-sm font-medium md:text-lg">
          <Calendar className="m-auto h-4 w-4 text-zinc-300" />
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
    </>
  );
}
