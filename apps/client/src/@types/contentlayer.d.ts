type PostProps = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  body: {
    code: string;
    raw?: string;
  };
  readingTime: {
    minutes: number;
  };
  status?: string;
  headings?: string[];
  tweetIds?: string[];
  publishedAt?: string;
  publishedAtFormatted?: string;
};

type ProjectProps = PostProps & {
  githubLink?: string;
  liveLink?: string;
  googlePlayLink?: string;
};
