create table daily_activity_time (
  id serial primary key,
  participant_id integer not null references participant(id) on delete cascade,
  pages_viewed integer not null,
  video_pages_viewed integer not null,
  video_time_viewed_seconds integer not null,
  time_spent_on_youtube_seconds integer not null,
  created_at date not null default now(),
  updated_at timestamp not null default now()
);
