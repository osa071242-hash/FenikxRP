"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReplyForm({ threadId }: { threadId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        threadId,
        body: form.get("body"),
      }),
    });
    setPending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Не удалось отправить");
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      {error ? <div className="alert">{error}</div> : null}
      <label>
        Сообщение
        <textarea name="body" required minLength={1} maxLength={8000} />
      </label>
      <button className="btn btn-primary" disabled={pending} type="submit">
        {pending ? "Отправка…" : "Отправить"}
      </button>
    </form>
  );
}
