alter table submissions add column if not exists batch_id uuid null;

create index if not exists idx_submissions_batch_id on submissions (batch_id) where batch_id is not null;
