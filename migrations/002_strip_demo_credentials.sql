-- Clear any previously seeded credential advertisement from site texts.
update site_texts
set value = '', updated_at = now()
where key = 'demo_note'
  and (
    value ilike '%admin123%'
    or value ilike '%demo-доступ%'
    or value ilike '%демо-доступ%'
  );

-- Remove known default demo accounts (exact bcrypt hashes from the old seed).
-- Posts/threads authored by them must go first (FK restrict).
delete from posts
where author_id in (
  select id from users
  where (
    username = 'admin'
    and password_hash = '$2b$10$3UMt6KlLsOudRIck3ztnJeOyHa.tpr1TkKDJYBAqFRPOlcefBi0Bu'
  )
  or (
    username = 'phoenix'
    and password_hash = '$2b$10$e6kOAy3Qx8u90NbohoJhj.zIimBq5.wOtk1ItrU/auN0Hr3NwkjZm'
  )
);

delete from threads
where author_id in (
  select id from users
  where (
    username = 'admin'
    and password_hash = '$2b$10$3UMt6KlLsOudRIck3ztnJeOyHa.tpr1TkKDJYBAqFRPOlcefBi0Bu'
  )
  or (
    username = 'phoenix'
    and password_hash = '$2b$10$e6kOAy3Qx8u90NbohoJhj.zIimBq5.wOtk1ItrU/auN0Hr3NwkjZm'
  )
);

delete from users
where (
  username = 'admin'
  and password_hash = '$2b$10$3UMt6KlLsOudRIck3ztnJeOyHa.tpr1TkKDJYBAqFRPOlcefBi0Bu'
)
or (
  username = 'phoenix'
  and password_hash = '$2b$10$e6kOAy3Qx8u90NbohoJhj.zIimBq5.wOtk1ItrU/auN0Hr3NwkjZm'
);
