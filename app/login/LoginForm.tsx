"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({
  nextPath,
  error,
}: {
  nextPath: string;
  error?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [localError, setLocalError] = useState(error || "");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setLocalError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password"),
      }),
    });
    setPending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setLocalError(data.error || "Не удалось войти");
      return;
    }
    router.push(nextPath);
    router.refresh();
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      {localError ? <div className="alert">{localError}</div> : null}
      <label>
        Логин
        <input name="username" autoComplete="username" required minLength={3} />
      </label>
      <label>
        Пароль
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
        />
      </label>
      <button className="btn btn-primary" disabled={pending} type="submit">
        {pending ? "Входим…" : "Войти"}
      </button>
    </form>
  );
}
