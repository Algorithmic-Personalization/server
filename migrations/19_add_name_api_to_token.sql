alter table token add column name text null default null;
alter table token add column api boolean not null default false;
