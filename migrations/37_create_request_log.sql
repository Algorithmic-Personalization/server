create type Verb as enum (
    'GET',
    'POST',
    'PATCH',
    'PUT',
    'DELETE'
    'OPTIONS',
    'HEAD',
    'TRACE',
    'CONNECT'
);

create table request_log (
    id serial primary key,
    latency_ms integer not null,
    request_id bigint not null,
    session_uuid uuid null references session (uuid) on delete cascade,
    verb Verb not null,
    path text not null,
    status_code integer not null,
    /* requests can optionally save all or part of their log output */
    message json null,
    /* admins can leave comments on requests */
    comment json null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);
