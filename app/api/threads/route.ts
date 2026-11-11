import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { createThread, getCategoryById } from "@/lib/forum";

const schema = z.object({
  categoryId: z.number().int().positive(),
  title: z.string().trim().min(3).max(140),
  body: z.string().trim().min(3).max(8000),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Нужен вход" }, { status: 401 });
  }
  try {
    const body = schema.parse(await req.json());
    const category = await getCategoryById(body.categoryId);
    if (!category) {
      return NextResponse.json({ error: "Каталог не найден" }, { status: 404 });
    }
    const thread = await createThread({
      categoryId: body.categoryId,
      authorId: user.id,
      title: body.title,
      body: body.body,
    });
    return NextResponse.json({ id: thread.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Некорректные данные" },
        { status: 400 },
      );
    }
    console.error("create thread failed", error);
    return NextResponse.json({ error: "Ошибка создания темы" }, { status: 500 });
  }
}
