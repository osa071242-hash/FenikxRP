import Link from "next/link";
import { listCategories } from "@/lib/forum";

export const dynamic = "force-dynamic";

export default async function ForumPage() {
  const categories = await listCategories();
  return (
    <section className="section">
      <div className="shell">
        <div className="section-head">
          <h2>Форум FenixRP</h2>
          <p>Выберите каталог, чтобы читать темы. Для публикации нужен вход.</p>
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
  );
}
