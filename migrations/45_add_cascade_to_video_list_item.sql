alter table video_list_item
    drop constraint video_list_item_event_id_fkey,
    add constraint video_list_item_event_id_fkey foreign key (event_id) references event(id) on delete cascade;

alter table video_list_item
    drop constraint video_list_item_video_id_fkey,
    add constraint video_list_item_video_id_fkey foreign key (video_id) references video(id) on delete cascade;
