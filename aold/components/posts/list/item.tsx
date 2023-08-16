import { Post } from "contentlayer/generated";
import { Clock } from "lucide-react";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";

import { BlurImage } from "aold/components/general/blur-image";
import { H2 } from "aold/components/general/typography/headings";
import { Paragraph } from "aold/components/general/typography/paragraphs";

export default function BlogCard(post: Post) {
  const { t } = useTranslation();

  return (
    <div className="group p-2 transition-all duration-150 hover:bg-zinc-400/5">
      <Link
        href="/posts/[slug]"
        as={`/posts/${post.slug}`}
      >
        <div className="grid gap-y-2">
          <H2 className="line-clamp-1 font-medium">{post.title}</H2>
          <Paragraph className="line-clamp-2 font-light">
            {post.description}
          </Paragraph>
          <div className="flex w-fit gap-x-2 text-zinc-500">
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
