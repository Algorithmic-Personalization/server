drop index voucher_participant_id_idx;

create unique index voucher_participant_id_idx on voucher(participant_id)
where participant_id is not null;
