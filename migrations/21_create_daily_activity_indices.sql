create unique index day_participant_id_idx on daily_activity_time (participant_id, created_at);
create index participant_id_daily_activity_time_idx on daily_activity_time (participant_id);
