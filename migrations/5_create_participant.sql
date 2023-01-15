create type ExperimentArm as enum ('treatment', 'control');

create table participant (
  id serial primary key,
  email text not null,
  code text not null,
  arm ExperimentArm not null,
  created_at timestamp not null,
  updated_at timestamp not null
);
