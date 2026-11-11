import { mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import bcrypt from "bcryptjs";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
let pool: pg.Pool | undefined;
let local: Promise<PGlite> | undefined;

export async function sql<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (databaseUrl !== "") {
    pool ??= new pg.Pool({ connectionString: databaseUrl, max: 5 });
    return (await pool.query(text, params)).rows as T[];
  }
  local ??= startLocal().catch((error: unknown) => {
    local = undefined;
    throw error;
  });
  return (await (await local).query<T>(text, params)).rows;
}

async function startLocal(): Promise<PGlite> {
  const dataDir = path.join(process.cwd(), ".data", "fenixrp");
  await mkdir(dataDir, { recursive: true });
  const db = new PGlite(dataDir);
  await db.waitReady;

  await db.exec(`
    create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `);
  const done = new Set(
    (
      await db.query<{ name: string }>("select name from schema_migrations")
    ).rows.map((r) => r.name),
  );
  const files = (await readdir("migrations").catch(() => []))
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    if (done.has(file)) continue;
    await db.exec(await readFile(`migrations/${file}`, "utf8"));
    await db.query("insert into schema_migrations (name) values ($1)", [file]);
  }

  await seedLocalDev(db);
  return db;
}

/** Local PGlite only — never runs when DATABASE_URL is set. */
async function seedLocalDev(db: PGlite) {
  await db.query(
    `update site_texts
     set value = '', updated_at = now()
     where key = 'demo_note'
       and (
         value ilike '%admin123%'
         or value ilike '%admin /%'
         or value ilike '%парол%'
       )`,
  );

  const users = await db.query<{ count: number }>(
    "select count(*)::int as count from users",
  );
  if ((users.rows[0]?.count ?? 0) > 0) return;

  const adminHash = await bcrypt.hash("admin123", 10);
  const phoenixHash = await bcrypt.hash("demo123", 10);

  await db.query(
    `insert into users (username, password_hash, role) values
      ($1, $2, 'admin'),
      ($3, $4, 'user')
     on conflict (username) do nothing`,
    ["admin", adminHash, "phoenix", phoenixHash],
  );

  const admin = (
    await db.query<{ id: number }>(
      "select id from users where username = 'admin' limit 1",
    )
  ).rows[0];
  if (!admin) return;

  const threadExists = await db.query<{ count: number }>(
    "select count(*)::int as count from threads",
  );
  if ((threadExists.rows[0]?.count ?? 0) > 0) return;

  const samples: { slug: string; title: string; body: string }[] = [
    {
      slug: "novosti",
      title: "Добро пожаловать на FenixRP",
      body: "Добро пожаловать в сообщество FenixRP! Читайте правила, выбирайте роль и начинайте свою историю в Los Santos.",
    },
    {
      slug: "novosti",
      title: "Обновление экономики: бизнесы и налоги",
      body: "С этого уикэнда обновляется налоговая система бизнесов. Подробности — в комментариях администрации.",
    },
    {
      slug: "pravila",
      title: "Основные правила RolePlay",
      body: "1) Не ломайте RP без причины. 2) Уважайте других игроков. 3) Метагейм и powergaming запрещены. Полный список — в закрепе.",
    },
    {
      slug: "roli",
      title: "Набор во фракцию LSPD",
      body: "LSPD открывает набор. Требования: чистая история нарушений, знание правил сервера, готовность к патрулям.",
    },
  ];

  for (const sample of samples) {
    const category = (
      await db.query<{ id: number }>(
        "select id from categories where slug = $1 limit 1",
        [sample.slug],
      )
    ).rows[0];
    if (!category) continue;
    const thread = (
      await db.query<{ id: number }>(
        `insert into threads (category_id, author_id, title)
         values ($1, $2, $3)
         returning id`,
        [category.id, admin.id, sample.title],
      )
    ).rows[0];
    if (!thread) continue;
    await db.query(
      `insert into posts (thread_id, author_id, body) values ($1, $2, $3)`,
      [thread.id, admin.id, sample.body],
    );
  }
}
