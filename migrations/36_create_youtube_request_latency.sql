create table youtube_request_latency (
    id serial primary key,
    request text not null,
    latency_ms real not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

create index youtube_request_latency_request_idx on youtube_request_latency (request);
create index youtube_request_latency_created_at_idx on youtube_request_latency (created_at);
