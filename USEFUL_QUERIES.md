Get all the videos which do not have metadata

```sql
select count(distinct v.youtube_id)
from video v
where not exists (
  select 1 from video_metadata m where m.youtube_id=v.youtube_id
)
```
