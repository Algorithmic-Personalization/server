alter type MetadataType add value if not exists 'VIEW_COUNT';
alter type MetadataType add value if not exists 'LIKE_COUNT';
alter type MetadataType add value if not exists 'COMMENT_COUNT';
alter type MetadataType add value if not exists 'TITLE';
alter type MetadataType add value if not exists 'DESCRIPTION';
alter type MetadataType add value if not exists 'PUBLISHED_AT';
alter type MetadataType add value if not exists 'YT_CHANNEL_ID';

drop table video_metadata;

create table video_metadata (
    id serial primary key,
    youtube_id text not null,
    type MetadataType not null,
    value json not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

create index video_metadata_youtube_id_idx on video_metadata (youtube_id);

create unique index video_metadata_youtube_category_id_idx on video_metadata (youtube_id)
where type = 'YT_CATEGORY_ID';


