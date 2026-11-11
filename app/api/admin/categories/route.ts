import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/forum";
import { slugSchema } from "@/lib/validation";

async function guard() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Только для админов" }, { status: 403 });
  }
  return null;
}

const upsertSchema = z.object({
  id: z.number().int().positive().optional(),
  slug: slugSchema,
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).default(""),
  sort_order: z.number().int().min(0).max(10000).default(0),
});

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  try {
    const body = upsertSchema.parse(await req.json());
    if (body.id) {
      const updated = await updateCategory(body.id, {
        slug: body.slug,
        title: body.title,
        description: body.description,
        sort_order: body.sort_order,
      });
      if (!updated) {
        return NextResponse.json({ error: "Не найдено" }, { status: 404 });
      }
      return NextResponse.json(updated);
    }
    const created = await createCategory({
      slug: body.slug,
      title: body.title,
      description: body.description,
      sort_order: body.sort_order,
    });
    return NextResponse.json(created);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Некорректные данные" },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Ошибка сохранения каталога" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  try {
    const { id } = z
      .object({ id: z.number().int().positive() })
      .parse(await req.json());
    await deleteCategory(id);
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
