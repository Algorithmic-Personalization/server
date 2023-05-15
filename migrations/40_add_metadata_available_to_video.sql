alter table video drop column category;
alter table video add column metadata_available boolean null default null;
