"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
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
      setError(data.error || "Не удалось зарегистрироваться");
      return;
    }
    router.push("/forum");
    router.refresh();
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      {error ? <div className="alert">{error}</div> : null}
      <label>
        Логин
        <input
          name="username"
          autoComplete="username"
          required
          minLength={3}
          maxLength={24}
          pattern="[A-Za-z0-9_]+"
          title="Латиница, цифры и _"
        />
      </label>
      <label>
        Пароль
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          maxLength={72}
        />
      </label>
      <button className="btn btn-primary" disabled={pending} type="submit">
        {pending ? "Создаём…" : "Создать аккаунт"}
      </button>
    </form>
  );
}
