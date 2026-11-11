import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import {
  createPost,
  deletePost,
  deleteThread,
  getThread,
  updatePost,
  updateThread,
} from "@/lib/forum";

async function guard() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Только для админов" }, { status: 403 });
  }
  return user;
}

export async function PATCH(req: Request) {
  const user = await guard();
  if (user instanceof NextResponse) return user;
  try {
    const body = z
      .object({
        type: z.enum(["post", "thread"]),
        id: z.number().int().positive(),
        body: z.string().trim().min(1).max(8000).optional(),
        title: z.string().trim().min(3).max(140).optional(),
      })
      .parse(await req.json());

    if (body.type === "post") {
      if (!body.body) {
        return NextResponse.json({ error: "Нужен текст" }, { status: 400 });
      }
      const updated = await updatePost(body.id, body.body);
      if (!updated) {
        return NextResponse.json({ error: "Не найдено" }, { status: 404 });
      }
      return NextResponse.json(updated);
    }

    if (!body.title) {
      return NextResponse.json({ error: "Нужен заголовок" }, { status: 400 });
    }
    const updated = await updateThread(body.id, body.title);
    if (!updated) {
      return NextResponse.json({ error: "Не найдено" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Некорректные данные" },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await guard();
  if (user instanceof NextResponse) return user;
  try {
    const body = z
      .object({
        type: z.enum(["post", "thread"]),
        id: z.number().int().positive(),
      })
      .parse(await req.json());

    if (body.type === "post") {
      await deletePost(body.id);
    } else {
      await deleteThread(body.id);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Некорректные данные" },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await guard();
  if (user instanceof NextResponse) return user;
  try {
    const body = z
      .object({
        threadId: z.number().int().positive(),
        body: z.string().trim().min(1).max(8000),
      })
      .parse(await req.json());
    const thread = await getThread(body.threadId);
    if (!thread) {
      return NextResponse.json({ error: "Тема не найдена" }, { status: 404 });
    }
    const post = await createPost({
      threadId: body.threadId,
      authorId: user.id,
      body: body.body,
    });
    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Некорректные данные" },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Ошибка создания" }, { status: 500 });
  }
}
