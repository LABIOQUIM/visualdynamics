import { Post } from "contentlayer/generated";
import Link from "next/link";

export default function BlogCard({ title, slug }: Partial<Post>) {
  return (
    <div className="group rounded-md border border-zinc-400 p-2 odd:bg-zinc-400/5 even:bg-zinc-400/20">
      <Link
        href="/blog/[slug]"
        as={`/blog/${slug}`}
      >
        <div className="">
          <h1 className="line-clamp-1 text-2xl">{title}</h1>
        </div>
      </Link>
    </div>
  );
}
