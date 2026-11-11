import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createSession,
  findUserByUsername,
  verifyPassword,
} from "@/lib/auth";
import { passwordSchema, usernameSchema } from "@/lib/validation";

const schema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const user = await findUserByUsername(body.username);
    if (!user || !(await verifyPassword(body.password, user.password_hash))) {
      return NextResponse.json(
        { error: "Неверный логин или пароль" },
        { status: 401 },
      );
    }
    await createSession({
      id: user.id,
      username: user.username,
      role: user.role,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Некорректные данные" },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Ошибка входа" }, { status: 500 });
  }
}
