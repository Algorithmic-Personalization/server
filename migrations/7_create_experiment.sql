create table experiment_config (
  id serial primary key,
  comment text not null,
  non_personalized_probability double precision not null,
  is_current boolean not null,
  created_at timestamp not null,
  updated_at timestamp not null
);

create unique index experiment_config_is_current_idx on experiment_config (is_current) where is_current = true;
