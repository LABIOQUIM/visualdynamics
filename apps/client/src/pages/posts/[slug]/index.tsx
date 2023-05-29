import { allPosts, Post } from "contentlayer/generated";
import { Calendar, Clock } from "lucide-react";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { useMDXComponent } from "next-contentlayer/hooks";
import useTranslation from "next-translate/useTranslation";

import { BlurImage } from "@app/components/general/blur-image";
import { components } from "@app/components/Post/MDX/MDXComponents";
import { SEO } from "@app/components/SEO";
import { H1 } from "@app/components/typography/headings";
import { Paragraph } from "@app/components/typography/paragraphs";

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

export const getStaticProps: GetStaticProps = async ({ params }) => {
  return {
    props: {
      post: allPosts.find((p) => p.slug === params?.slug)
    }
  };
};

export default function BlogPost({ post }: { post: Post }) {
  const { t } = useTranslation();
  const MDXContent = useMDXComponent(post ? post.body.code : "");
  const router = useRouter();

  return (
    <>
      <SEO title={post.title} />
      <H1>{post?.title}</H1>
      <div className="mb-2.5 flex flex-col items-center gap-4 text-gray-500 md:flex-row">
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
      <Paragraph className="italic">{post?.description}</Paragraph>

      <div className="mt-3 grid">
        <MDXContent
          components={{
            ...components
          }}
        />
      </div>
    </>
  );
}
