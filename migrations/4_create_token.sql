create table token (
    id serial primary key,
    token text not null,
    admin_id integer not null references admin (id) on delete cascade,
    was_invalidated boolean not null default false,
    created_at timestamp not null,
    updated_at timestamp not null
);

create index token_admin_id_idx on token (admin_id);
create index token_token_idx on token (token);
