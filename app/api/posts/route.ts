import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { createPost, getThread } from "@/lib/forum";

const schema = z.object({
  threadId: z.number().int().positive(),
  body: z.string().trim().min(1).max(8000),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Нужен вход" }, { status: 401 });
  }
  try {
    const body = schema.parse(await req.json());
    const thread = await getThread(body.threadId);
    if (!thread) {
      return NextResponse.json({ error: "Тема не найдена" }, { status: 404 });
    }
    const post = await createPost({
      threadId: body.threadId,
      authorId: user.id,
      body: body.body,
    });
    return NextResponse.json({ id: post.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Некорректные данные" },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Ошибка публикации" }, { status: 500 });
  }
}
