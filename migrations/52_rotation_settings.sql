create table channel_rotation_speed_setting (
    id serial primary key,
    speed_hours real not null,
    is_current boolean not null default false,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

create unique index channel_rotation_speed_setting_is_current
    on channel_rotation_speed_setting (is_current)
    where is_current = true;
