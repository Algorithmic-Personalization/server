create table reset_password_token (
    id serial not null,
    participant_id int not null references participant(id),
    token text not null,
    used_at timestamp null default null,
    valid_until timestamp not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

create unique index reset_password_token_token_unique_idx on reset_password_token(token);
