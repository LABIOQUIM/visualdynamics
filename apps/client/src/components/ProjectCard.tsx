import Link from "next/link";

import { BlurImage } from "./BlurImage";
import { Icons } from "./Icons";

export function ProjectCard({
  slug,
  title,
  description,
  githubLink,
  googlePlayLink,
  liveLink,
  imageAlt,
  image
}: ProjectProps) {
  return (
    <div className="group">
      <Link
        href="/projects/[slug]"
        as={`/projects/${slug}`}
      >
        <div className="rounded border-2 border-transparent transition-all duration-100 ease-linear">
          <div className="h-[150px] w-full">
            {image ? (
              <BlurImage
                src={image}
                alt={imageAlt ?? "Project Image"}
                className="h-[150px] w-full rounded object-fill"
                height={0}
                width={0}
                sizes="100vw"
                loading="lazy"
              />
            ) : null}
          </div>
          <h4 className="pt-2 text-sm font-bold text-zinc-400 transition-colors duration-100 ease-linear group-hover:text-gray-300">
            {title}
          </h4>
          <p className="py-1 font-grotesk text-xs text-zinc-400/90 transition-colors duration-100 ease-linear line-clamp-2 group-hover:text-gray-300">
            {description}
          </p>
        </div>
      </Link>

      <div className="flex w-full items-center gap-x-2 pt-2">
        {githubLink ? (
          <Link
            href={githubLink}
            target="_blank"
            rel="noreferrer"
            className="group rounded bg-gray-1001 p-2 transition-colors duration-100 ease-linear hover:bg-gray-1001/70"
          >
            <Icons.Github
              size={16}
              className="text-zinc-400 transition-colors duration-100 ease-linear group-hover:text-gray-100"
            />
          </Link>
        ) : null}
        {liveLink ? (
          <Link
            href={liveLink}
            target="_blank"
            rel="noreferrer"
            className="group rounded bg-gray-1001 p-2 transition-colors duration-100 ease-linear hover:bg-gray-1001/70"
          >
            <Icons.Link
              size={16}
              className="text-zinc-400  transition-colors duration-100 ease-linear group-hover:text-gray-100"
            />
          </Link>
        ) : null}
        {googlePlayLink ? (
          <Link
            href={googlePlayLink}
            target="_blank"
            rel="noreferrer"
            className="group rounded bg-gray-1001 p-2 transition-colors duration-100 ease-linear hover:bg-gray-1001/70"
          >
            <Icons.GooglePlay
              size={16}
              className="text-zinc-400 transition-colors duration-100 ease-linear group-hover:text-gray-100"
            />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
