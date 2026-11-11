# FenixRP — форум GTA 5 RolePlay

Next.js App Router форум сообщества FenixRP: регистрация/вход, каталоги и темы, админ-панель.

## Локально

```bash
env -u DATABASE_URL npm install
env -u DATABASE_URL npm run dev
```

Откройте http://127.0.0.1:3000

Без `DATABASE_URL` используется файловый PGlite в `.data/fenixrp`. С Postgres — задайте `DATABASE_URL` и при сборке применится `scripts/migrate.mjs`.

## Аккаунты

- **Production (Postgres):** пароли в миграциях не сидятся. Первый зарегистрированный пользователь становится admin.
- **Локально (PGlite, без `DATABASE_URL`):** при пустой БД создаётся локальный admin для разработки — не публикуется в UI.
- Гости читают форум; писать можно после входа или регистрации на `/register`.

## Админка

`/admin` (только role=admin):

1. **Каталоги** — создать/изменить/удалить разделы форума
2. **Посты и темы** — редактировать/удалять темы и сообщения
3. **Тексты сайта** — homepage/about/footer

## Публикация (Cursor)

В корне: `cursor-app.json` → `{ "database": "postgres" }`, миграции в `migrations/`.  
Обязательно задайте `SESSION_SECRET` для подписи cookie-сессий на хостинге. Локально без Postgres секрет может генерироваться эфемерно на процесс.
