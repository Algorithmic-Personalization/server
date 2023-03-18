create type OperatorType as enum (
    'ANY',
    'ALL'
);

alter table transition_setting add column operator OperatorType not null default 'ANY';
