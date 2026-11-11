"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: number;
  slug: string;
  title: string;
  description: string;
  sort_order: number;
};

type Post = {
  id: number;
  thread_id: number;
  body: string;
  created_at: string;
  thread_title: string;
  author_name: string;
};

type Thread = {
  id: number;
  title: string;
  category_title?: string;
  author_name?: string;
  updated_at: string;
};

export function AdminPanel({
  categories,
  posts,
  threads,
  texts,
}: {
  categories: Category[];
  posts: Post[];
  threads: Thread[];
  texts: Record<string, string>;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"categories" | "posts" | "texts">("categories");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [catForm, setCatForm] = useState({
    id: 0,
    slug: "",
    title: "",
    description: "",
    sort_order: 0,
  });
  const [textForm, setTextForm] = useState(texts);

  const sortedCats = useMemo(
    () => [...categories].sort((a, b) => a.sort_order - b.sort_order),
    [categories],
  );

  function flash(ok: string) {
    setMessage(ok);
    setError("");
    router.refresh();
  }

  function fail(msg: string) {
    setError(msg);
    setMessage("");
  }

  async function saveCategory(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: catForm.id || undefined,
        slug: catForm.slug,
        title: catForm.title,
        description: catForm.description,
        sort_order: Number(catForm.sort_order) || 0,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      fail(data.error || "Ошибка сохранения каталога");
      return;
    }
    setCatForm({ id: 0, slug: "", title: "", description: "", sort_order: 0 });
    flash(catForm.id ? "Каталог обновлён" : "Каталог создан");
  }

  async function removeCategory(id: number) {
    if (!confirm("Удалить каталог вместе с темами?")) return;
    const res = await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      fail(data.error || "Ошибка удаления");
      return;
    }
    flash("Каталог удалён");
  }

  async function editPost(post: Post) {
    const body = prompt("Текст поста", post.body);
    if (body == null) return;
    const res = await fetch("/api/admin/posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "post", id: post.id, body }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      fail(data.error || "Ошибка обновления поста");
      return;
    }
    flash("Пост обновлён");
  }

  async function removePost(id: number) {
    if (!confirm("Удалить пост?")) return;
    const res = await fetch("/api/admin/posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "post", id }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      fail(data.error || "Ошибка удаления");
      return;
    }
    flash("Пост удалён");
  }

  async function editThread(thread: Thread) {
    const title = prompt("Заголовок темы", thread.title);
    if (title == null) return;
    const res = await fetch("/api/admin/posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "thread", id: thread.id, title }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      fail(data.error || "Ошибка обновления темы");
      return;
    }
    flash("Тема обновлена");
  }

  async function removeThread(id: number) {
    if (!confirm("Удалить тему и все посты?")) return;
    const res = await fetch("/api/admin/posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "thread", id }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      fail(data.error || "Ошибка удаления");
      return;
    }
    flash("Тема удалена");
  }

  async function saveTexts(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/texts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: textForm }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      fail(data.error || "Ошибка сохранения текстов");
      return;
    }
    flash("Тексты сайта сохранены");
  }

  return (
    <div className="admin-grid">
      <div className="admin-tabs">
        <button
          className={`btn ${tab === "categories" ? "btn-primary" : "btn-ghost"}`}
          type="button"
          onClick={() => setTab("categories")}
        >
          Каталоги
        </button>
        <button
          className={`btn ${tab === "posts" ? "btn-primary" : "btn-ghost"}`}
          type="button"
          onClick={() => setTab("posts")}
        >
          Посты и темы
        </button>
        <button
          className={`btn ${tab === "texts" ? "btn-primary" : "btn-ghost"}`}
          type="button"
          onClick={() => setTab("texts")}
        >
          Тексты сайта
        </button>
      </div>

      {message ? <div className="alert alert-ok">{message}</div> : null}
      {error ? <div className="alert">{error}</div> : null}

      {tab === "categories" ? (
        <div className="panel">
          <form className="form" onSubmit={saveCategory}>
            <h3 style={{ margin: 0 }}>
              {catForm.id ? `Редактировать #${catForm.id}` : "Новый каталог"}
            </h3>
            <label>
              Название
              <input
                value={catForm.title}
                onChange={(e) =>
                  setCatForm((s) => ({
                    ...s,
                    title: e.target.value,
                    slug:
                      s.id && s.slug
                        ? s.slug
                        : e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, "")
                            .slice(0, 64),
                  }))
                }
                required
              />
            </label>
            <label>
              Slug
              <input
                value={catForm.slug}
                onChange={(e) =>
                  setCatForm((s) => ({ ...s, slug: e.target.value }))
                }
                required
                pattern="[a-z0-9-]+"
              />
            </label>
            <label>
              Описание
              <textarea
                value={catForm.description}
                onChange={(e) =>
                  setCatForm((s) => ({ ...s, description: e.target.value }))
                }
              />
            </label>
            <label>
              Порядок
              <input
                type="number"
                value={catForm.sort_order}
                onChange={(e) =>
                  setCatForm((s) => ({
                    ...s,
                    sort_order: Number(e.target.value) || 0,
                  }))
                }
              />
            </label>
            <div className="actions">
              <button className="btn btn-primary" type="submit">
                Сохранить
              </button>
              {catForm.id ? (
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() =>
                    setCatForm({
                      id: 0,
                      slug: "",
                      title: "",
                      description: "",
                      sort_order: 0,
                    })
                  }
                >
                  Сбросить
                </button>
              ) : null}
            </div>
          </form>

          <table className="table" style={{ marginTop: "1.5rem" }}>
            <thead>
              <tr>
                <th>Каталог</th>
                <th>Slug</th>
                <th>Порядок</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedCats.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.title}</strong>
                    <div className="meta">{c.description}</div>
                  </td>
                  <td>{c.slug}</td>
                  <td>{c.sort_order}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-ghost"
                        type="button"
                        onClick={() =>
                          setCatForm({
                            id: c.id,
                            slug: c.slug,
                            title: c.title,
                            description: c.description,
                            sort_order: c.sort_order,
                          })
                        }
                      >
                        Изменить
                      </button>
                      <button
                        className="btn btn-danger"
                        type="button"
                        onClick={() => removeCategory(c.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "posts" ? (
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Темы</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Тема</th>
                <th>Каталог</th>
                <th>Автор</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {threads.map((t) => (
                <tr key={t.id}>
                  <td>{t.title}</td>
                  <td>{t.category_title}</td>
                  <td>{t.author_name}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-ghost"
                        type="button"
                        onClick={() => editThread(t)}
                      >
                        Изменить
                      </button>
                      <button
                        className="btn btn-danger"
                        type="button"
                        onClick={() => removeThread(t.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Посты</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Тема</th>
                <th>Автор</th>
                <th>Текст</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <td>{p.thread_title}</td>
                  <td>{p.author_name}</td>
                  <td style={{ maxWidth: 320 }}>
                    {p.body.slice(0, 120)}
                    {p.body.length > 120 ? "…" : ""}
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-ghost"
                        type="button"
                        onClick={() => editPost(p)}
                      >
                        Изменить
                      </button>
                      <button
                        className="btn btn-danger"
                        type="button"
                        onClick={() => removePost(p.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "texts" ? (
        <div className="panel">
          <form className="form" onSubmit={saveTexts}>
            {(
              [
                ["home_headline", "Заголовок главной"],
                ["home_subhead", "Подзаголовок главной"],
                ["home_cta", "Текст кнопки CTA"],
                ["about_title", "Заголовок «О проекте»"],
                ["about_body", "Текст «О проекте»"],
                ["footer_copy", "Подвал"],
                ["demo_note", "Демо-заметка"],
              ] as const
            ).map(([key, label]) => (
              <label key={key}>
                {label}
                {key === "about_body" ? (
                  <textarea
                    value={textForm[key] || ""}
                    onChange={(e) =>
                      setTextForm((s) => ({ ...s, [key]: e.target.value }))
                    }
                  />
                ) : (
                  <input
                    value={textForm[key] || ""}
                    onChange={(e) =>
                      setTextForm((s) => ({ ...s, [key]: e.target.value }))
                    }
                  />
                )}
              </label>
            ))}
            <button className="btn btn-primary" type="submit">
              Сохранить тексты
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
