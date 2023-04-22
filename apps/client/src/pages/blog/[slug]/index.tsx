import { allPosts } from "contentlayer/generated";
import { useMDXComponent } from "next-contentlayer/hooks";

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
    <>
      <h2 className="text-xl font-bold tracking-tighter md:text-4xl">
        {post?.title}
      </h2>
      <p className="my-1.5 text-base font-medium italic tracking-tighter text-gray-600 dark:text-gray-400 md:text-lg">
        {post?.description}
      </p>
      <div className="mt-8 grid text-gray-800 dark:text-gray-200">
        <MDXContent
          components={{
            ...components
          }}
        />
      </div>
    </>
  );
}
