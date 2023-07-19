import { allPosts, Post } from "contentlayer/generated";
import { Calendar, Clock } from "lucide-react";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { useMDXComponent } from "next-contentlayer/hooks";
import useTranslation from "next-translate/useTranslation";

import { BlurImage } from "@app/components/general/blur-image";
import { PageLayout } from "@app/components/general/page-layout";
import { H1 } from "@app/components/general/typography/headings";
import { Paragraph } from "@app/components/general/typography/paragraphs";
import { components } from "@app/components/posts/mdx-components";
import { SEO } from "@app/components/seo";

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const paths: { params: { slug: string }; locale: string }[] = [];

  for (const locale of locales as string[]) {
    allPosts.forEach((p) => {
      paths.push({
        params: { slug: p.slug },
        locale
      });
    });
  }

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
    <PageLayout>
      <SEO title={post.title} />
      <H1>{post.title}</H1>
      <div className="flex w-fit gap-x-4">
        {post.authors.map((author) => (
          <div
            className="flex w-fit gap-x-2"
            key={author.name}
          >
            <BlurImage
              className="h-6 w-6 rounded-full"
              alt={author.name}
              src={author.image}
              width={0}
              height={0}
              unoptimized
            />
            <p>{author.name}</p>
          </div>
        ))}
      </div>
      <div className="mb-2.5 flex flex-col items-center gap-4 text-gray-500 md:flex-row">
        <p className="flex items-center gap-x-2 text-sm font-medium md:text-lg">
          <Clock className="m-auto h-4 w-4 text-zinc-300" />
          {t("common:blog.readtime", {
            minutes: Math.round(post.readingTime.minutes)
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
          }).format(new Date(post.publishedAt))}
        </p>
      </div>
      <Paragraph className="italic">{post.description}</Paragraph>

      <div className="mt-3 grid">
        <MDXContent
          components={{
            ...components
          }}
        />
      </div>
    </PageLayout>
  );
}
