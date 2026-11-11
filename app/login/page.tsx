import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getSiteTexts } from "@/lib/forum";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const user = await getSessionUser();
  if (user) redirect("/forum");
  const params = await searchParams;
  const texts = await getSiteTexts();

  return (
    <section className="section">
      <div className="shell" style={{ maxWidth: 480 }}>
        <div className="section-head">
          <h2>Вход</h2>
          <p>Войдите, чтобы создавать темы и отвечать.</p>
        </div>
        <div className="panel">
          <LoginForm nextPath={params.next || "/forum"} error={params.error} />
          {texts.demo_note ? <p className="demo-note">{texts.demo_note}</p> : null}
          <p style={{ marginTop: "1rem", color: "var(--muted)" }}>
            Нет аккаунта? <Link href="/register">Регистрация</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
