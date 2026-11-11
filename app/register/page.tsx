import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { RegisterForm } from "./RegisterForm";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) redirect("/forum");

  return (
    <section className="section">
      <div className="shell" style={{ maxWidth: 480 }}>
        <div className="section-head">
          <h2>Регистрация</h2>
          <p>Создайте аккаунт FenixRP, чтобы писать на форуме.</p>
        </div>
        <div className="panel">
          <RegisterForm />
          <p style={{ marginTop: "1rem", color: "var(--muted)" }}>
            Уже есть аккаунт? <Link href="/login">Войти</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
