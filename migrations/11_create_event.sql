create type EventType as enum (
    'PAGE_VIEW',
    'RECOMMENDATIONS_SHOWN',
    'PERSONALIZED_CLICKED',
    'NON_PERSONALIZED_CLICKED',
    'MIXED_CLICKED'
);

create table event (
    id serial primary key,
    session_uuid uuid not null references session (uuid) on delete cascade,
    experiment_config_id integer not null references experiment_config (id) on delete cascade,
    arm ExperimentArm not null,
    type EventType not null,
    url text not null,
    created_at timestamp not null,
    updated_at timestamp not null
);

create index event_session_uuid_idx on event (session_uuid);
create index event_experiment_config_id_idx on event (experiment_config_id);
