import { allPosts } from "contentlayer/generated";
import { useMDXComponent } from "next-contentlayer/hooks";

import { PageLayout } from "@app/components/Layout/Page";
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
  const MDXContent = useMDXComponent(post ? post.body.code : "");

  return (
    <PageLayout title="Blog">
      <h2 className="text-xl font-extrabold leading-snug tracking-tighter md:text-4xl">
        {post?.title}
      </h2>
      <p className="my-1.5 text-base font-medium italic leading-snug tracking-tighter text-zinc-600 md:text-lg">
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
