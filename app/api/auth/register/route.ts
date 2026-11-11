import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, createUser, findUserByUsername } from "@/lib/auth";
import { passwordSchema, usernameSchema } from "@/lib/validation";

const schema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const existing = await findUserByUsername(body.username);
    if (existing) {
      return NextResponse.json(
        { error: "Такой логин уже занят" },
        { status: 409 },
      );
    }
    const user = await createUser(body.username, body.password);
    await createSession(user);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Некорректные данные" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Ошибка регистрации" },
      { status: 500 },
    );
  }
}
