-- Extensions
create extension if not exists "uuid-ossp";

-- Enums
create type submission_status as enum (
  'pending_review',
  'isbn_required',
  'unidentifiable',
  'offer_sent',
  'pass_sent',
  'accepted',
  'declined'
);

create type contact_preference as enum ('sms', 'email');
create type book_condition as enum ('like_new', 'good', 'acceptable', 'poor');
create type isbn_confidence_level as enum ('low', 'medium', 'high');

-- Submissions
create table submissions (
  id uuid primary key default uuid_generate_v4(),
  reference_number text not null default '',
  status submission_status not null default 'pending_review',
  photo_urls text[] not null default '{}',
  contact_preference contact_preference not null,
  contact_value text not null,
  condition book_condition not null,
  isbn text,
  notes text,
  created_at timestamptz not null default now(),

  -- Phase 2: AI Vision (nullable — populated by Edge Function)
  isbn_extracted text,
  isbn_confidence isbn_confidence_level,
  title text,
  author text,
  edition text,
  publisher text,
  asin text,
  claude_response jsonb,

  -- Phase 2: Pricing
  keepa_data jsonb,
  amazon_data jsonb,
  recommended_offer numeric(10,2),
  confidence_level text,
  flags text[] default '{}',

  -- Phase 2: Seller decision
  final_offer numeric(10,2),
  seller_notes text,
  responded_at timestamptz,

  constraint notes_max_length check (length(notes) <= 200),
  constraint isbn_format check (
    isbn is null or (isbn ~ '^\d{9}[\dX]$' or isbn ~ '^\d{13}$')
  )
);

-- Auto-generate reference_number from UUID on insert
create or replace function set_reference_number()
returns trigger as $$
begin
  new.reference_number = upper(right(replace(new.id::text, '-', ''), 6));
  return new;
end;
$$ language plpgsql;

create trigger trg_set_reference_number
  before insert on submissions
  for each row execute function set_reference_number();

-- Pricing rules (single row, seller config)
create table pricing_rules (
  id uuid primary key default uuid_generate_v4(),
  target_roi_min numeric(5,4) not null default 0.50,
  max_buy_price numeric(10,2),
  slow_mover_rank_threshold integer,
  avoid_amazon_present boolean not null default true,
  category_overrides jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- Seed default pricing rules row
insert into pricing_rules (target_roi_min, avoid_amazon_present)
values (0.50, true);

-- Row Level Security
alter table submissions enable row level security;
alter table pricing_rules enable row level security;

-- Students (anonymous) can insert submissions
create policy "public_insert_submissions" on submissions
  for insert to anon with check (true);

-- Only authenticated seller can read/update submissions
create policy "seller_read_submissions" on submissions
  for select to authenticated using (true);

create policy "seller_update_submissions" on submissions
  for update to authenticated using (true) with check (true);

create policy "seller_delete_submissions" on submissions
  for delete to authenticated using (true);

-- Only seller can manage pricing rules
create policy "seller_manage_pricing_rules" on pricing_rules
  for all to authenticated using (true);

-- Storage bucket for book photos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'book-photos',
  'book-photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp']
);

-- Public can upload to book-photos (students don't auth)
create policy "public_upload_photos" on storage.objects
  for insert to anon with check (
    bucket_id = 'book-photos' and
    name like 'submissions/%'
  );

-- Only seller can read/delete photos
create policy "seller_read_photos" on storage.objects
  for select to authenticated using (bucket_id = 'book-photos');

create policy "seller_delete_photos" on storage.objects
  for delete to authenticated using (bucket_id = 'book-photos');
