alter table experiment_config
  add column admin_id integer references admin (id) not null;
