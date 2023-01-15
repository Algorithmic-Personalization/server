create table admin (
  id serial primary key,
  name text not null,
  email text not null,
  password text not null,
  created_at timestamp not null,
  updated_at timestamp not null
);
