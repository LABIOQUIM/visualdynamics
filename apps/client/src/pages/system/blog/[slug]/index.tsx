import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { allPosts } from "contentlayer/generated";
import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { useMDXComponent } from "next-contentlayer/hooks";

import { components } from "@app/components/MDX/MDXComponents";

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: allPosts.map((p) => ({ params: { slug: p.slug } })),
    fallback: false
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  return {
    props: {
      project: allPosts.find((p) => p.slug === params?.slug)
    }
  };
};

export default function Page({ post }: { post: PostProps }) {
  const MDXContent = useMDXComponent(post ? post.body.code : "");

  return (
    <section className="mx-auto max-w-2xl px-2 pt-10">
      <Link
        href="/blog"
        className="group inline-flex rounded bg-gray-1001 p-2 transition-colors duration-100 ease-linear hover:bg-gray-1001/70"
      >
        <MdOutlineKeyboardBackspace className="text-zinc-400 transition-colors duration-100 ease-linear group-hover:text-gray-100" />
      </Link>
      <div className="pt-5">
        <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold leading-snug tracking-tighter md:text-5xl">
          {post?.title}
        </h2>
        <p className="mx-auto my-3 max-w-2xl text-base font-medium italic leading-snug tracking-tighter text-zinc-400 md:text-lg">
          {post?.description}
        </p>
        <div className="mx-auto mt-8 grid max-w-4xl text-zinc-400">
          <MDXContent
            components={{
              ...components
            }}
          />
        </div>
      </div>
    </section>
  );
}
