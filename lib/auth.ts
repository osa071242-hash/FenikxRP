import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";

const COOKIE = "fenixrp_session";
const MAX_AGE = 60 * 60 * 24 * 14;

export type SessionUser = {
  id: number;
  username: string;
  role: "user" | "admin";
};

function secretKey() {
  const secret =
    process.env.SESSION_SECRET?.trim() ||
    "fenixrp-local-dev-only-change-me-in-prod";
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    id: user.id,
    username: user.username,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.set(COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const id = Number(payload.id);
    const username = String(payload.username ?? "");
    if (!id || !username) return null;
    const rows = await sql<{
      id: number;
      username: string;
      role: "user" | "admin";
    }>("select id, username, role from users where id = $1 and username = $2", [
      id,
      username,
    ]);
    const user = rows[0];
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      role: user.role === "admin" ? "admin" : "user",
    };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("FORBIDDEN");
  return user;
}

export async function findUserByUsername(username: string) {
  const rows = await sql<{
    id: number;
    username: string;
    password_hash: string;
    role: "user" | "admin";
  }>("select id, username, password_hash, role from users where username = $1", [
    username,
  ]);
  return rows[0] ?? null;
}

export async function createUser(username: string, password: string) {
  const passwordHash = await hashPassword(password);
  const rows = await sql<{ id: number; username: string; role: "user" | "admin" }>(
    `insert into users (username, password_hash, role)
     values ($1, $2, 'user')
     returning id, username, role`,
    [username, passwordHash],
  );
  return rows[0];
}
