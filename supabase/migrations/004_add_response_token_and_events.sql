-- One-click accept/decline token on each offer
alter table submissions add column if not exists response_token uuid unique;

-- Activity log for notifications
create table if not exists submission_events (
  id           uuid primary key default uuid_generate_v4(),
  submission_id uuid not null references submissions(id) on delete cascade,
  event_type   text not null,   -- 'student_responded'
  old_status   text,
  new_status   text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_submission_events_created_at
  on submission_events (created_at desc);

alter table submission_events enable row level security;

-- Only authenticated seller can read events
create policy "seller_read_events" on submission_events
  for select to authenticated using (true);

grant select on submission_events to authenticated;
