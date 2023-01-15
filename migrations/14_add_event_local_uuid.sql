alter table event add column local_uuid text not null default gen_random_uuid();
create unique index event_local_uuid_idx on event (local_uuid);
