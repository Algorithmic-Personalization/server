alter table admin add column email_verified boolean not null default false;
alter table admin add column verification_token text not null default '';
