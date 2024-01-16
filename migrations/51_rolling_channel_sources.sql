create table channel_source (
    id serial primary key,
    title text null,
    is_default boolean not null default false,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

create unique index channel_source_is_default_unique_idx on channel_source (is_default) where is_default = true;

create table channel_source_item (
    id serial primary key,
    channel_source_id integer not null references channel_source(id) on delete cascade,
    position integer not null,
    youtube_channel_id text not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

alter table participant
    add column channel_source_id integer null references channel_source(id) on delete set null;

alter table participant
    add column pos_in_channel_source integer not null default 0;

alter table participant
    add column pos_in_channel_source_last_updated_at timestamp null default now();
