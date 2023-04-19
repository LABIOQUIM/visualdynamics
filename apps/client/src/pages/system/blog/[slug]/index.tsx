import { allPosts } from "contentlayer/generated";
import { GetStaticPaths, GetStaticProps } from "next";
import { useMDXComponent } from "next-contentlayer/hooks";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { PageLayout } from "@app/components/Layout/Page";
import { components } from "@app/components/MDX/MDXComponents";

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: allPosts.map((p) => ({ params: { slug: p.slug } })),
    fallback: false
  };
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  return {
    props: {
      post: allPosts.find((p) => p.slug === params?.slug),
      ...(await serverSideTranslations(locale ?? "en-US", ["features"]))
    }
  };
};

export default function BlogPost({ post }: { post: PostProps }) {
  const MDXContent = useMDXComponent(post ? post.body.code : "");

  return (
    <PageLayout title="Blog">
      <h2 className="text-xl font-extrabold leading-snug tracking-tighter md:text-4xl">
        {post?.title}
      </h2>
      <p className="my-1.5 text-base font-medium italic leading-snug tracking-tighter text-zinc-400 md:text-lg">
        {post?.description}
      </p>
      <div className="mt-8 grid text-zinc-800">
        <MDXContent
          components={{
            ...components
          }}
        />
      </div>
    </PageLayout>
  );
}
