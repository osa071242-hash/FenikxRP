import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import {
  getSiteTexts,
  listAllPostsAdmin,
  listCategories,
  listRecentThreads,
} from "@/lib/forum";
import { AdminPanel } from "./AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/forum");

  const [categories, posts, threads, texts] = await Promise.all([
    listCategories(),
    listAllPostsAdmin(),
    listRecentThreads(50),
    getSiteTexts(),
  ]);

  return (
    <section className="section">
      <div className="shell">
        <div className="section-head">
          <h2>Админ-панель</h2>
          <p>Управление каталогами, постами и текстами сайта.</p>
        </div>
        <AdminPanel
          categories={categories}
          posts={posts}
          threads={threads}
          texts={texts}
        />
      </div>
    </section>
  );
}
