alter table transition_event
    alter column event_id drop not null;

alter table transition_event
    add column participant_id integer not null references participant(id) on delete cascade;
