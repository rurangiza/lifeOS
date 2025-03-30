import Link from "next/link";
import { compareDesc, format, parseISO } from "date-fns";
import { allPosts, Post } from "contentlayer/generated";

interface Note {
  title: string;
  date: string;
}

function PostCard(post: Post) {
  const markup = { __html: (post.body as any).html || "" };
  return (
    <div className="flex justify-between items-center pb-2 pt-2 hover:bg-[#FAFAFA] p-1 border-t-1 border-[#EDEDED]">
      <Link
        href={post.url}
      >
        {post.title}
      </Link>
      <time dateTime={post.date} className="text-sm">
        {format(parseISO(post.date), "LLLL d, yyyy")}
      </time>
      {/* <div
        className="text-sm [&>*]:mb-3 [&>*:last-child]:mb-0"
        dangerouslySetInnerHTML={markup}
      /> */}
    </div>
  );
}

export default function Articles() {
  const posts = allPosts.sort((a: Note, b: Note) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

  return (
    <div>
      {posts.filter((post, idx) => {
        if (post.published) {
          return post
        }
      }).map((post, idx) => (
        <PostCard key={idx} {...post} />
      ))}
    </div>
  );
}
