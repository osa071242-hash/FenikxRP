"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewThreadForm({ categoryId }: { categoryId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId,
        title: form.get("title"),
        body: form.get("body"),
      }),
    });
    setPending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Не удалось создать тему");
      return;
    }
    const data = await res.json();
    router.push(`/thread/${data.id}`);
    router.refresh();
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      {error ? <div className="alert">{error}</div> : null}
      <label>
        Заголовок
        <input name="title" required minLength={3} maxLength={140} />
      </label>
      <label>
        Сообщение
        <textarea name="body" required minLength={3} maxLength={8000} />
      </label>
      <button className="btn btn-primary" disabled={pending} type="submit">
        {pending ? "Публикуем…" : "Создать тему"}
      </button>
    </form>
  );
}
