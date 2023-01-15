create table video (
  id serial primary key,
  title text not null,
  url text not null,
  youtube_id text not null,
  created_at timestamp not null,
  updated_at timestamp not null
);

create unique index video_youtube_id_idx on video (youtube_id);
create unique index video_url_idx on video (url);

create type ListType as enum ('PERSONALIZED', 'NON_PERSONALIZED', 'SHOWN');
create type VideoType as enum('PERSONALIZED', 'NON_PERSONALIZED', 'MIXED');

create table video_list_item(
    id serial primary key,
    event_id integer not null references event(id),
    video_id integer not null references video(id),
    list_type ListType not null,
    video_type VideoType not null,
    created_at timestamp not null,
    updated_at timestamp not null
);
