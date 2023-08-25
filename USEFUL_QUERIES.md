Get all the videos which do not have metadata

```sql
select count(distinct v.youtube_id)
from video v
where not exists (
  select 1 from video_metadata m where m.youtube_id=v.youtube_id
)
```

Delete all participants with very little data:

```sql
delete from participant where id not in (
select p.id
from participant p
inner join session s
on s.participant_code = p.code
inner join event e
on e.session_uuid = s.uuid
where e.type='PAGE_VIEW'
group by p.id
having count(*) > 10
)
```
