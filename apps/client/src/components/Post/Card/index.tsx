import { Post } from "contentlayer/generated";
import { Clock } from "lucide-react";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";

import { BlurImage } from "@app/components/BlurImage";

export default function BlogCard(post: Post) {
  const { t } = useTranslation();

  return (
    <div className="group p-2 transition-all duration-150 hover:bg-zinc-400/5">
      <Link
        href="/posts/[slug]"
        as={`/posts/${post.slug}`}
      >
        <div className="grid gap-y-2">
          <h1 className="line-clamp-1 text-xl font-medium">{post.title}</h1>
          <p className="line-clamp-2 text-sm font-thin">{post.description}</p>
          <div className="flex w-fit gap-x-2 text-zinc-500">
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
            &bull;
            <div className="flex w-fit gap-x-2">
              <Clock className="m-auto h-4 w-4 text-zinc-300" />
              <p>
                {t("common:blog.readtime", {
                  minutes: Math.round(post?.readingTime.minutes)
                })}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
