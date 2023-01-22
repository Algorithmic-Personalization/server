alter type EventType add value if not exists 'WATCH_TIME';

create table watch_time (
    event_id integer not null primary key references event (id) on delete cascade,
    seconds_watched double precision not null
);

create index watch_time_seconds_watched_idx on watch_time (seconds_watched);
