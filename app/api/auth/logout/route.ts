import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

async function logout(req: Request) {
  await destroySession();
  const accept = req.headers.get("accept") || "";
  if (accept.includes("text/html")) {
    return NextResponse.redirect(new URL("/", req.url), 303);
  }
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  return logout(req);
}

export async function GET(req: Request) {
  return logout(req);
}
