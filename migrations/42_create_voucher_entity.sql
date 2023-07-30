create table voucher (
    id serial primary key,
    participant_id integer null references participant(id),
    voucher_code text not null,
    created_at timestamp not null,
    updated_at timestamp not null,
    delivered_at timestamp null,
    check ((participant_id is null and delivered_at is null) or (participant_id is not null and delivered_at is not null))
);

create unique index voucher_code_unique_idx on voucher(voucher_code);
create index voucher_participant_id_idx on voucher(participant_id);
create index voucher_delivered_at_idx on voucher(delivered_at);

