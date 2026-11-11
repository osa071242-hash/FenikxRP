# FenixRP — форум GTA 5 RolePlay

Next.js App Router форум сообщества FenixRP: регистрация/вход, каталоги и темы, админ-панель.

## Локально

```bash
env -u DATABASE_URL npm install
env -u DATABASE_URL npm run dev
```

Откройте http://127.0.0.1:3000

Без `DATABASE_URL` используется файловый PGlite в `.data/fenixrp`. С Postgres — задайте `DATABASE_URL` и при сборке применится `scripts/migrate.mjs`.

## Демо-админ

- Логин: `admin`
- Пароль: `admin123`
- Смените пароль после первого входа.

Обычный пользователь: регистрация на `/register`. Гости читают форум; писать можно только после входа.

## Админка

`/admin` (только role=admin):

1. **Каталоги** — создать/изменить/удалить разделы форума
2. **Посты и темы** — редактировать/удалять темы и сообщения
3. **Тексты сайта** — homepage/about/footer и демо-заметку

## Публикация (Cursor)

В корне: `cursor-app.json` → `{ "database": "postgres" }`, миграции в `migrations/`.  
Опционально задайте секрет `SESSION_SECRET` для подписи cookie-сессий.
