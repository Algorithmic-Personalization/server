alter table participant add column phase smallint not null default 0;

alter type EventType add value if not exists 'PHASE_TRANSITION';

create table transition_setting (
    id serial primary key,
    from_phase smallint not null,
    to_phase smallint not null,
    is_current boolean not null,
    min_pages_viewed integer not null,
    min_video_pages_viewed integer not null,
    min_video_time_viewed_seconds real not null,
    min_time_spent_on_youtube_seconds real not null,
    min_sidebar_recommendations_clicked integer not null,
    min_days integer not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

create type TransitionReason as enum (
    'AUTOMATIC',
    'FORCED'
);

create table transition_event (
    id serial primary key,
    event_id integer not null references event(id) on delete cascade,
    transition_setting_id integer not null references transition_setting(id) on delete cascade,
    reason TransitionReason not null,
    from_phase smallint not null,
    to_phase smallint not null,
    pages_viewed integer not null,
    video_pages_viewed integer not null,
    video_time_viewed_seconds real not null,
    time_spent_on_youtube_seconds real not null,
    sidebar_recommendations_clicked integer not null,
    num_criteria_met_days integer not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

create unique index transition_setting_is_current_idx on transition_setting (
    from_phase,
    to_phase,
    is_current
) where is_current = true;
