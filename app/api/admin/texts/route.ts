import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { setSiteText } from "@/lib/forum";

async function guard() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Только для админов" }, { status: 403 });
  }
  return null;
}

const schema = z.object({
  texts: z.record(z.string(), z.string().max(4000)),
});

const ALLOWED = new Set([
  "home_headline",
  "home_subhead",
  "home_cta",
  "about_title",
  "about_body",
  "footer_copy",
  "demo_note",
]);

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  try {
    const body = schema.parse(await req.json());
    for (const [key, value] of Object.entries(body.texts)) {
      if (!ALLOWED.has(key)) continue;
      await setSiteText(key, value.trim());
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Некорректные данные" },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Ошибка сохранения текстов" }, { status: 500 });
  }
}
