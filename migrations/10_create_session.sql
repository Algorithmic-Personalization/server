create table session (
    id serial primary key,
    uuid uuid default gen_random_uuid() not null,
    participant_code text not null references participant (code) on delete cascade,
    created_at timestamp not null,
    updated_at timestamp not null
);

create unique index session_uuid_idx on session (uuid);
create index session_participant_code_idx on session (participant_code);
