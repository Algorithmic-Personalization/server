alter table transition_event
    add constraint transition_event_fkeys_nullity
        check (
            (event_id is null and transition_setting_id is null and reason = 'FORCED')
            or
            (event_id is not null and transition_setting_id is not null and reason = 'AUTOMATIC')
        );
