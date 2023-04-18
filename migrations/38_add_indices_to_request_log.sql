create unique index request_log_request_id_created_at_idx on request_log (request_id, created_at);
create index request_log_session_uuid_idx on request_log (session_uuid);
create index request_log_latency_ms_idx on request_log (latency_ms);
create index request_log_status_code_idx on request_log (status_code);
create index request_log_path_idx on request_log (path);
