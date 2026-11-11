import Link from "next/link";
import type { SessionUser } from "@/lib/auth";

export function Header({ user }: { user: SessionUser | null }) {
  return (
    <header className="site-header">
      <div className="shell nav">
        <Link href="/" className="brand">
          Fenix<span>RP</span>
        </Link>
        <nav className="nav-links">
          <Link href="/forum">Форум</Link>
          <Link href="/about">О проекте</Link>
          {user ? (
            <>
              {user.role === "admin" ? <Link href="/admin">Админ</Link> : null}
              <span>{user.username}</span>
              <form action="/api/auth/logout" method="post">
                <button className="btn btn-ghost" type="submit">
                  Выйти
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Вход</Link>
              <Link className="btn btn-primary" href="/register">
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
