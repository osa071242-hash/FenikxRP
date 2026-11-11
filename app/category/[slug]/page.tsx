import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import {
  getCategoryBySlug,
  listThreadsByCategory,
} from "@/lib/forum";
import { NewThreadForm } from "./NewThreadForm";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const [threads, user] = await Promise.all([
    listThreadsByCategory(category.id),
    getSessionUser(),
  ]);

  return (
    <section className="section">
      <div className="shell">
        <div className="section-head">
          <h2>{category.title}</h2>
          <p>{category.description}</p>
        </div>

        <div className="thread-list" style={{ marginBottom: "2rem" }}>
          {threads.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>Пока нет тем в этом каталоге.</p>
          ) : (
            threads.map((t) => (
              <Link key={t.id} href={`/thread/${t.id}`} className="thread-row">
                <div>
                  <h3>{t.title}</h3>
                  <div className="meta">
                    {t.author_name} · {t.post_count ?? 0} сообщ.
                  </div>
                </div>
                <div className="meta">
                  {new Date(t.updated_at).toLocaleString("ru-RU")}
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Новая тема</h3>
          {user ? (
            <NewThreadForm categoryId={category.id} />
          ) : (
            <p style={{ color: "var(--muted)", marginBottom: 0 }}>
              <Link href={`/login?next=/category/${category.slug}`}>
                Войдите
              </Link>
              , чтобы создать тему.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
