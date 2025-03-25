import Link from "next/link";
import { compareDesc, format, parseISO } from "date-fns";
import { allPosts, Post } from "contentlayer/generated";

interface Note {
  title: string;
  date: string;
}
function PostCard(post: Post) {
  const markup = { __html: post.body || "" };
  return (
    <div className="mb-8">
      <h2 className="mb-1 text-xl">
        <Link
          href={post.url}
          className="text-blue-700 hover:text-blue-900 dark:text-blue-400"
        >
          {post.title}
        </Link>
      </h2>
      <time dateTime={post.date} className="mb-2 block text-xs text-gray-600">
        {format(parseISO(post.date), "LLLL d, yyyy")}
      </time>
      <div
        className="text-sm [&>*]:mb-3 [&>*:last-child]:mb-0"
        dangerouslySetInnerHTML={markup}
      />
    </div>
  );
}

export default function Home() {
  const posts = allPosts.sort((a: Note, b: Note) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

  return (
    <div>
      <h1 className="mb-8 text-2xl font-black">
        Hi, I'm Arsène. I'm a software engineer interrested in building tools
        for thoughts, agents and better UX.
      </h1>
      {posts.map((post, idx) => (
        <PostCard key={idx} {...post} />
      ))}
    </div>
  );
}
