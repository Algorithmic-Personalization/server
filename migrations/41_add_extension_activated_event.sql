alter type EventType add value if not exists 'EXTENSION_ACTIVATED';

alter table participant add column extension_activated_at timestamp null;
