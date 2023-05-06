drop table video_metadata;
drop type MetadataType;

create table video_metadata (
    id serial primary key,
    youtube_id text not null,
    youtube_category_id text not null,
    category_title text not null,
    youtube_channel_id text not null,
    video_title text not null,
    video_description text null,
    published_at timestamp not null,
    view_count bigint not null,
    like_count bigint not null,
    comment_count bigint not null,
    tags text[] not null,
    topic_categories text[] not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

create unique index video_metadata_youtube_id_idx on video_metadata (youtube_id);
create index video_metadata_youtube_category_id_idx on video_metadata (youtube_category_id);

