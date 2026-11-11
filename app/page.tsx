import Link from "next/link";
import { listCategories, listRecentThreads, getSiteTexts } from "@/lib/forum";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [texts, categories, recent] = await Promise.all([
    getSiteTexts(),
    listCategories(),
    listRecentThreads(6),
  ]);

  return (
    <>
      <section className="hero">
        <div className="hero-media" aria-hidden />
        <div className="hero-glow" aria-hidden />
        <div className="shell hero-copy">
          <p className="hero-brand">
            Fenix<em>RP</em>
          </p>
          <h1>{texts.home_headline || "Город, где каждая история имеет значение"}</h1>
          <p>
            {texts.home_subhead ||
              "Форум сообщества FenixRP — новости, правила, роли и обсуждения."}
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/forum">
              {texts.home_cta || "Открыть каталоги"}
            </Link>
            <Link className="btn btn-ghost" href="/about">
              О проекте
            </Link>
          </div>
          {texts.demo_note ? <p className="demo-note">{texts.demo_note}</p> : null}
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head">
            <h2>Каталоги</h2>
            <p>Разделы форума для новостей, правил и RolePlay-ролей.</p>
          </div>
          <div className="catalog-list">
            {categories.map((c) => (
              <Link key={c.id} href={`/category/${c.slug}`} className="catalog-row">
                <div>
                  <h3>{c.title}</h3>
                  <p>{c.description}</p>
                </div>
                <div className="meta">{c.thread_count ?? 0} тем</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <div className="section-head">
            <h2>Свежие темы</h2>
            <p>Последние обсуждения сообщества.</p>
          </div>
          <div className="thread-list">
            {recent.map((t) => (
              <Link key={t.id} href={`/thread/${t.id}`} className="thread-row">
                <div>
                  <h3>{t.title}</h3>
                  <div className="meta">
                    {t.category_title} · {t.author_name} · {t.post_count ?? 0}{" "}
                    сообщ.
                  </div>
                </div>
                <div className="meta">
                  {new Date(t.updated_at).toLocaleString("ru-RU")}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
