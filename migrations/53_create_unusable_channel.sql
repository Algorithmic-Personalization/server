create table unusable_channel (
    id serial primary key,
    youtube_channel_id text not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

create unique index unusable_channels_youtube_channel_id
    on unusable_channel (youtube_channel_id);
