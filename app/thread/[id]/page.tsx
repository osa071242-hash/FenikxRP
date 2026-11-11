import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getThread, listPosts } from "@/lib/forum";
import { ReplyForm } from "./ReplyForm";

export const dynamic = "force-dynamic";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const threadId = Number(id);
  if (!Number.isFinite(threadId)) notFound();

  const thread = await getThread(threadId);
  if (!thread) notFound();
  const [posts, user] = await Promise.all([
    listPosts(thread.id),
    getSessionUser(),
  ]);

  return (
    <section className="section">
      <div className="shell" style={{ maxWidth: 860 }}>
        <div className="section-head">
          <div className="meta" style={{ marginBottom: "0.5rem" }}>
            <Link href={`/category/${thread.category_slug}`}>
              {thread.category_title}
            </Link>
          </div>
          <h2>{thread.title}</h2>
          <p>
            Автор темы: {thread.author_name} ·{" "}
            {new Date(thread.created_at).toLocaleString("ru-RU")}
          </p>
        </div>

        <div>
          {posts.map((p) => (
            <article key={p.id} className="post">
              <div className="post-meta">
                <strong>{p.author_name}</strong>
                {p.author_role === "admin" ? (
                  <span className="badge">admin</span>
                ) : null}
                <span>{new Date(p.created_at).toLocaleString("ru-RU")}</span>
              </div>
              <div className="post-body">{p.body}</div>
            </article>
          ))}
        </div>

        <div className="panel" style={{ marginTop: "1.5rem" }}>
          <h3 style={{ marginTop: 0 }}>Ответить</h3>
          {user ? (
            <ReplyForm threadId={thread.id} />
          ) : (
            <p style={{ color: "var(--muted)", marginBottom: 0 }}>
              <Link href={`/login?next=/thread/${thread.id}`}>Войдите</Link>,
              чтобы ответить.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
