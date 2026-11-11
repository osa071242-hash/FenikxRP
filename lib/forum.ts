import { sql } from "@/lib/db";

export type Category = {
  id: number;
  slug: string;
  title: string;
  description: string;
  sort_order: number;
  thread_count?: number;
};

export type ThreadRow = {
  id: number;
  category_id: number;
  author_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
  category_slug?: string;
  category_title?: string;
  post_count?: number;
};

export type PostRow = {
  id: number;
  thread_id: number;
  author_id: number;
  body: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_role?: string;
};

export async function getSiteTexts() {
  const rows = await sql<{ key: string; value: string }>(
    "select key, value from site_texts",
  );
  return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<
    string,
    string
  >;
}

export async function setSiteText(key: string, value: string) {
  await sql(
    `insert into site_texts (key, value, updated_at)
     values ($1, $2, now())
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [key, value],
  );
}

export async function listCategories() {
  return sql<Category>(
    `select c.*,
      (select count(*)::int from threads t where t.category_id = c.id) as thread_count
     from categories c
     order by c.sort_order asc, c.id asc`,
  );
}

export async function getCategoryBySlug(slug: string) {
  const rows = await sql<Category>(
    "select * from categories where slug = $1",
    [slug],
  );
  return rows[0] ?? null;
}

export async function getCategoryById(id: number) {
  const rows = await sql<Category>("select * from categories where id = $1", [
    id,
  ]);
  return rows[0] ?? null;
}

export async function createCategory(input: {
  slug: string;
  title: string;
  description: string;
  sort_order: number;
}) {
  const rows = await sql<Category>(
    `insert into categories (slug, title, description, sort_order)
     values ($1, $2, $3, $4)
     returning *`,
    [input.slug, input.title, input.description, input.sort_order],
  );
  return rows[0];
}

export async function updateCategory(
  id: number,
  input: {
    slug: string;
    title: string;
    description: string;
    sort_order: number;
  },
) {
  const rows = await sql<Category>(
    `update categories
     set slug = $2, title = $3, description = $4, sort_order = $5
     where id = $1
     returning *`,
    [id, input.slug, input.title, input.description, input.sort_order],
  );
  return rows[0] ?? null;
}

export async function deleteCategory(id: number) {
  await sql("delete from categories where id = $1", [id]);
}

export async function listThreadsByCategory(categoryId: number) {
  return sql<ThreadRow>(
    `select t.*, u.username as author_name,
      (select count(*)::int from posts p where p.thread_id = t.id) as post_count
     from threads t
     join users u on u.id = t.author_id
     where t.category_id = $1
     order by t.updated_at desc`,
    [categoryId],
  );
}

export async function listRecentThreads(limit = 8) {
  return sql<ThreadRow>(
    `select t.*, u.username as author_name, c.slug as category_slug, c.title as category_title,
      (select count(*)::int from posts p where p.thread_id = t.id) as post_count
     from threads t
     join users u on u.id = t.author_id
     join categories c on c.id = t.category_id
     order by t.updated_at desc
     limit $1`,
    [limit],
  );
}

export async function getThread(id: number) {
  const rows = await sql<ThreadRow>(
    `select t.*, u.username as author_name, c.slug as category_slug, c.title as category_title
     from threads t
     join users u on u.id = t.author_id
     join categories c on c.id = t.category_id
     where t.id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createThread(input: {
  categoryId: number;
  authorId: number;
  title: string;
  body: string;
}) {
  const threads = await sql<ThreadRow>(
    `insert into threads (category_id, author_id, title)
     values ($1, $2, $3)
     returning *`,
    [input.categoryId, input.authorId, input.title],
  );
  const thread = threads[0];
  await sql(
    `insert into posts (thread_id, author_id, body) values ($1, $2, $3)`,
    [thread.id, input.authorId, input.body],
  );
  return thread;
}

export async function updateThread(id: number, title: string) {
  const rows = await sql<ThreadRow>(
    `update threads set title = $2, updated_at = now() where id = $1 returning *`,
    [id, title],
  );
  return rows[0] ?? null;
}

export async function deleteThread(id: number) {
  await sql("delete from threads where id = $1", [id]);
}

export async function listPosts(threadId: number) {
  return sql<PostRow>(
    `select p.*, u.username as author_name, u.role as author_role
     from posts p
     join users u on u.id = p.author_id
     where p.thread_id = $1
     order by p.created_at asc`,
    [threadId],
  );
}

export async function createPost(input: {
  threadId: number;
  authorId: number;
  body: string;
}) {
  const rows = await sql<PostRow>(
    `insert into posts (thread_id, author_id, body)
     values ($1, $2, $3)
     returning *`,
    [input.threadId, input.authorId, input.body],
  );
  await sql(`update threads set updated_at = now() where id = $1`, [
    input.threadId,
  ]);
  return rows[0];
}

export async function updatePost(id: number, body: string) {
  const rows = await sql<PostRow>(
    `update posts set body = $2, updated_at = now() where id = $1 returning *`,
    [id, body],
  );
  return rows[0] ?? null;
}

export async function deletePost(id: number) {
  await sql("delete from posts where id = $1", [id]);
}

export async function getPost(id: number) {
  const rows = await sql<PostRow>("select * from posts where id = $1", [id]);
  return rows[0] ?? null;
}

export async function listAllPostsAdmin() {
  return sql<
    PostRow & { thread_title: string; author_name: string }
  >(
    `select p.*, t.title as thread_title, u.username as author_name
     from posts p
     join threads t on t.id = p.thread_id
     join users u on u.id = p.author_id
     order by p.created_at desc
     limit 100`,
  );
}
