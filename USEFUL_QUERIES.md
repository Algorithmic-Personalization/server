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

Get the activity report:

```sql
select date(e.created_at) as day,
count(distinct s.participant_code) as nParticipants,
sum(case e.type when 'PAGE_VIEW' then 1 else 0 end) as sumPagesViewed,
sum(case e.type
    when 'PAGE_VIEW'
        then
            case when e.url LIKE '%/watch%' then
                1 else
                0 end
            else
            0
        end) as sumVideoPagesViewed,
sum(
    case e.type when 'NON_PERSONALIZED_CLICKED' then 1
                when 'PERSONALIZED_CLICKED' then 1
                when 'MIXED_CLICKED' then 1
                else 0
            end
    ) as sumClicks
from event e
inner join session s on s.uuid = e.session_uuid
group by date(e.created_at)
order by day DESC
limit 10
```

How many participants on a given version?

```sql
select count(distinct p.id)
from participant p
inner join session s on s.participant_code = p.code
inner join event e on e.session_uuid = s.uuid
where e.extension_version='2.1.1'
```
