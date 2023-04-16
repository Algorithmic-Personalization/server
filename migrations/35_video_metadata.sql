create table video_category (
    id serial primary key,
    youtube_id text not null,
    title text not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

create unique index video_category_youtube_id_idx on video_category (youtube_id);
create index video_category_title_idx on video_category (title);

create type MetadataType as enum (
    'TAG',
    'TOPIC_CATEGORY',
    'YT_CATEGORY_ID',
    'YT_CATEGORY_TITLE'
);

alter table video add column category text null;

create table video_metadata (
    id serial primary key,
    youtube_id text not null,
    type MetadataType not null,
    value text not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

create index video_metadata_youtube_id_type_idx on video_metadata (youtube_id, type);

create unique index video_metadata_youtube_category_id_idx on video_metadata (youtube_id)
where type = 'YT_CATEGORY_ID';


