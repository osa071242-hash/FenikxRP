create table if not exists users (
  id serial primary key,
  username text not null unique,
  password_hash text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id serial primary key,
  slug text not null unique,
  title text not null,
  description text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists threads (
  id serial primary key,
  category_id int not null references categories(id) on delete cascade,
  author_id int not null references users(id) on delete restrict,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists threads_category_id_idx on threads(category_id);
create index if not exists threads_updated_at_idx on threads(updated_at desc);

create table if not exists posts (
  id serial primary key,
  thread_id int not null references threads(id) on delete cascade,
  author_id int not null references users(id) on delete restrict,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_thread_id_idx on posts(thread_id);

create table if not exists site_texts (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into users (username, password_hash, role) values
  ('admin', '$2b$10$3UMt6KlLsOudRIck3ztnJeOyHa.tpr1TkKDJYBAqFRPOlcefBi0Bu', 'admin'),
  ('phoenix', '$2b$10$e6kOAy3Qx8u90NbohoJhj.zIimBq5.wOtk1ItrU/auN0Hr3NwkjZm', 'user')
on conflict (username) do nothing;

insert into categories (slug, title, description, sort_order) values
  ('novosti', 'Новости сервера', 'Анонсы обновлений, ивенты и важные объявления FenixRP.', 10),
  ('pravila', 'Правила и гайды', 'Правила RolePlay, FAQ и полезные гайды для новичков.', 20),
  ('roli', 'Роли и фракции', 'Обсуждение фракций, бизнесов и карьер на сервере.', 30),
  ('offtop', 'Оффтоп', 'Свободное общение вне игрового лора.', 40)
on conflict (slug) do nothing;

insert into site_texts (key, value) values
  ('home_headline', 'Город, где каждая история имеет значение'),
  ('home_subhead', 'Форум сообщества FenixRP — новости, правила, роли и обсуждения игроков Los Santos.'),
  ('home_cta', 'Открыть каталоги'),
  ('about_title', 'О проекте FenixRP'),
  ('about_body', 'FenixRP — GTA 5 RolePlay сообщество с акцентом на живые истории, уважение к лору и честную игру. Здесь публикуются анонсы, правила, гайды фракций и обсуждения игроков.'),
  ('footer_copy', 'FenixRP · GTA 5 RolePlay · Форум сообщества'),
  ('demo_note', 'Демо-доступ админа: admin / admin123 — смените пароль после первого входа.')
on conflict (key) do nothing;

insert into threads (category_id, author_id, title)
select c.id, u.id, t.title
from (values
  ('novosti', 'Добро пожаловать на FenixRP'),
  ('novosti', 'Обновление экономики: бизнесы и налоги'),
  ('pravila', 'Основные правила RolePlay'),
  ('roli', 'Набор во фракцию LSPD')
) as t(slug, title)
join categories c on c.slug = t.slug
join users u on u.username = 'admin'
where not exists (select 1 from threads limit 1);

insert into posts (thread_id, author_id, body)
select th.id, th.author_id, p.body
from (values
  ('Добро пожаловать на FenixRP', 'Добро пожаловать в сообщество FenixRP! Читайте правила, выбирайте роль и начинайте свою историю в Los Santos.'),
  ('Обновление экономики: бизнесы и налоги', 'С этого уикэнда обновляется налоговая система бизнесов. Подробности — в комментариях администрации.'),
  ('Основные правила RolePlay', '1) Не ломайте RP без причины. 2) Уважайте других игроков. 3) Метагейм и powergaming запрещены. Полный список — в закрепе.'),
  ('Набор во фракцию LSPD', 'LSPD открывает набор. Требования: чистая история нарушений, знание правил сервера, готовность к патрулям.')
) as p(title, body)
join threads th on th.title = p.title
where not exists (select 1 from posts limit 1);
