-- ============================================
-- MIGRATIONS (idempotent — safe against any prior schema state)
-- ============================================
do $$ begin if exists (
  select 1
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'payments'
    and column_name = 'kapital_order_id'
) then
alter table public.payments
alter column kapital_order_id drop not null;
end if;
end $$;
-- ============================================
-- PROFILES TABLE
-- ============================================
create table if not exists profiles (
  id uuid references auth.users (id) on delete cascade primary key,
  email text,
  full_name text,
  is_subscribed boolean default false,
  subscription_expires_at timestamptz,
  created_at timestamptz default now()
);
-- Ensures these columns exist even if `profiles` already existed before this
-- script ran (the create table above is a no-op in that case).
alter table profiles
add column if not exists phone text;
alter table profiles
add column if not exists last_duration_type text;
alter table profiles
add column if not exists last_periods int default 1;
-- Remove auto-renewal related columns (no longer needed)
alter table profiles drop column if exists card_id;
alter table profiles drop column if exists card_uuid;
alter table profiles drop column if exists card_uuid;
alter table profiles drop column if exists auto_renew;
alter table profiles drop column if exists renewal_attempt_count;
alter table profiles drop column if exists last_renewal_attempt_at;
-- Ensure foreign key has ON DELETE CASCADE for existing deployments
do $$ begin if exists (
  select 1
  from pg_constraint
  where conname = 'profiles_id_fkey'
    and conrelid = 'public.profiles'::regclass
) then
alter table profiles drop constraint profiles_id_fkey;
alter table profiles
add constraint profiles_id_fkey foreign key (id) references auth.users(id) on delete cascade;
end if;
end $$;
alter table profiles enable row level security;
drop policy if exists "Users can view their own profile" on profiles;
create policy "Users can view their own profile" on profiles for
select using (auth.uid () = id);
drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile" on profiles for
update using (auth.uid () = id);
-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP (captures full_name now)
-- ============================================
create or replace function public.handle_new_user () returns trigger as $$ begin
insert into public.profiles (id, email, full_name, phone)
values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  );
return new;
end;
$$ language plpgsql security definer;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after
insert on auth.users for each row execute procedure public.handle_new_user ();
-- Backfill phone from auth metadata for existing users
update public.profiles p
set phone = u.raw_user_meta_data->>'phone'
from auth.users u
where p.id = u.id
  and (p.phone is null or p.phone = '')
  and coalesce(u.raw_user_meta_data->>'phone', '') <> '';
-- courses
create table if not exists topics (
  id uuid primary key default gen_random_uuid (),
  order_index integer not null,
  slug text unique not null,
  title text not null,
  description text,
  created_at timestamptz default now()
);
create table if not exists sub_lessons (
  id uuid primary key default gen_random_uuid (),
  topic_id uuid references topics (id) on delete cascade not null,
  order_index integer not null,
  title text not null,
  created_at timestamptz default now()
);
do $$ begin if not exists (
  select 1
  from pg_type
  where typname = 'sub_lesson_file_type'
) then create type sub_lesson_file_type as enum ('theory', 'test');
end if;
end $$;
create table if not exists sub_lesson_files (
  id uuid primary key default gen_random_uuid (),
  sub_lesson_id uuid references sub_lessons (id) on delete cascade not null,
  file_type sub_lesson_file_type not null,
  storage_path text not null,
  original_filename text not null,
  created_at timestamptz default now()
);
create table if not exists topic_files (
  id uuid primary key default gen_random_uuid (),
  topic_id uuid references topics (id) on delete cascade not null,
  storage_path text not null,
  original_filename text not null,
  title text,
  created_at timestamptz default now()
);
create table if not exists exams (
  id uuid primary key default gen_random_uuid (),
  order_index integer not null,
  title text not null,
  created_at timestamptz default now()
);
do $$ begin if not exists (
  select 1
  from pg_type
  where typname = 'exam_file_type'
) then create type exam_file_type as enum ('exam', 'answer_key');
end if;
end $$;
create table if not exists exam_files (
  id uuid primary key default gen_random_uuid (),
  exam_id uuid references exams (id) on delete cascade not null,
  file_type exam_file_type not null,
  storage_path text not null,
  original_filename text not null,
  created_at timestamptz default now()
);
create table if not exists exam_topics (
  exam_id uuid references exams (id) on delete cascade not null,
  topic_id uuid references topics (id) on delete cascade not null,
  primary key (exam_id, topic_id)
);
alter table topics enable row level security;
alter table sub_lessons enable row level security;
alter table sub_lesson_files enable row level security;
alter table topic_files enable row level security;
alter table exams enable row level security;
alter table exam_files enable row level security;
alter table exam_topics enable row level security;
drop policy if exists "Subscribed users can view topics" on topics;
create policy "Subscribed users can view topics" on topics for
select using (
    exists (
      select 1
      from profiles
      where profiles.id = auth.uid ()
        and profiles.is_subscribed = true
        and (
          profiles.subscription_expires_at is null
          or profiles.subscription_expires_at > now()
        )
    )
  );
drop policy if exists "Subscribed users can view sub_lessons" on sub_lessons;
create policy "Subscribed users can view sub_lessons" on sub_lessons for
select using (
    exists (
      select 1
      from profiles
      where profiles.id = auth.uid ()
        and profiles.is_subscribed = true
        and (
          profiles.subscription_expires_at is null
          or profiles.subscription_expires_at > now()
        )
    )
  );
drop policy if exists "Subscribed users can view sub_lesson_files" on sub_lesson_files;
create policy "Subscribed users can view sub_lesson_files" on sub_lesson_files for
select using (
    exists (
      select 1
      from profiles
      where profiles.id = auth.uid ()
        and profiles.is_subscribed = true
        and (
          profiles.subscription_expires_at is null
          or profiles.subscription_expires_at > now()
        )
    )
  );
drop policy if exists "Subscribed users can view topic_files" on topic_files;
create policy "Subscribed users can view topic_files" on topic_files for
select using (
    exists (
      select 1
      from profiles
      where profiles.id = auth.uid ()
        and profiles.is_subscribed = true
        and (
          profiles.subscription_expires_at is null
          or profiles.subscription_expires_at > now()
        )
    )
  );
drop policy if exists "Subscribed users can view exams" on exams;
create policy "Subscribed users can view exams" on exams for
select using (
    exists (
      select 1
      from profiles
      where profiles.id = auth.uid ()
        and profiles.is_subscribed = true
        and (
          profiles.subscription_expires_at is null
          or profiles.subscription_expires_at > now()
        )
    )
  );
drop policy if exists "Subscribed users can view exam_files" on exam_files;
create policy "Subscribed users can view exam_files" on exam_files for
select using (
    exists (
      select 1
      from profiles
      where profiles.id = auth.uid ()
        and profiles.is_subscribed = true
        and (
          profiles.subscription_expires_at is null
          or profiles.subscription_expires_at > now()
        )
    )
  );
drop policy if exists "Subscribed users can view exam_topics" on exam_topics;
create policy "Subscribed users can view exam_topics" on exam_topics for
select using (
    exists (
      select 1
      from profiles
      where profiles.id = auth.uid ()
        and profiles.is_subscribed = true
        and (
          profiles.subscription_expires_at is null
          or profiles.subscription_expires_at > now()
        )
    )
  );
-- other query
drop policy if exists "Subscribed users can read course files" on storage.objects;
create policy "Subscribed users can read course files" on storage.objects for
select using (
    bucket_id = 'courses'
    and exists (
      select 1
      from profiles
      where profiles.id = auth.uid ()
        and profiles.is_subscribed = true
        and (
          profiles.subscription_expires_at is null
          or profiles.subscription_expires_at > now()
        )
    )
  );
-- grants
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant select,
  update on public.profiles to authenticated;
grant select on public.topics to authenticated;
grant select on public.sub_lessons to authenticated;
grant select on public.sub_lesson_files to authenticated;
grant select on public.topic_files to authenticated;
grant select on public.exams to authenticated;
grant select on public.exam_files to authenticated;
grant select on public.exam_topics to authenticated;
-- progress
create table if not exists user_progress (
  id uuid primary key default gen_random_uuid (),
  user_id uuid references auth.users (id) on delete cascade not null,
  file_id uuid not null,
  -- id from sub_lesson_files, topic_files, or exam_files
  file_table text not null,
  -- 'sub_lesson_files' | 'topic_files' | 'exam_files'
  completed_at timestamptz default now(),
  unique (user_id, file_id, file_table)
);
alter table user_progress enable row level security;
drop policy if exists "Users can view their own progress" on user_progress;
create policy "Users can view their own progress" on user_progress for
select using (auth.uid () = user_id);
drop policy if exists "Users can insert their own progress" on user_progress;
create policy "Users can insert their own progress" on user_progress for
insert with check (auth.uid () = user_id);
drop policy if exists "Users can delete their own progress" on user_progress;
create policy "Users can delete their own progress" on user_progress for delete using (auth.uid () = user_id);
grant select,
  insert,
  delete on public.user_progress to authenticated;
-- payment
create table if not exists payments (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete cascade not null,
  amount numeric not null,
  currency text not null default 'AZN',
  plan_months int not null,
  -- how many months this purchase extends
  status text not null default 'pending',
  -- pending | paid | failed
  payriff_order_id text,
  payriff_transaction_id text,
  is_renewal boolean not null default false,
  created_at timestamptz default now()
);
-- Same idempotency guarantee as profiles above.
alter table payments
add column if not exists payriff_order_id text;
alter table payments
add column if not exists payriff_transaction_id text;
alter table payments
add column if not exists is_renewal boolean not null default false;
-- Ensure foreign key has ON DELETE CASCADE for existing deployments
do $$ begin if exists (
  select 1
  from pg_constraint
  where conname = 'payments_user_id_fkey'
    and conrelid = 'public.payments'::regclass
) then
alter table payments drop constraint payments_user_id_fkey;
alter table payments
add constraint payments_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
end if;
end $$;
alter table payments enable row level security;
drop policy if exists "Users can view their own payments" on payments;
create policy "Users can view their own payments" on payments for
select using (auth.uid () = user_id);
-- Client insert/update policies dropped to prevent tampering with financial state
drop policy if exists "Users can insert their own payments" on payments;
drop policy if exists "Users can update their own payments" on payments;
grant all on public.payments to service_role;
drop policy if exists "Service role can update payments" on payments;
create policy "Service role can update payments" on payments for
update using (true);
-- Authenticated users may only read their own payments; all writes must go through privileged server-side clients
revoke
insert,
  update,
  delete on public.payments
from authenticated;
grant select on public.payments to authenticated;
-- ============================================
-- PAYMENT CONSENTS: TERMS & PRIVACY ACCEPTANCE
-- ============================================
create table if not exists payment_consents (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete cascade not null,
  payment_id bigint references payments (id) on delete cascade not null,
  terms_revision text not null,
  privacy_revision text not null,
  consented_at timestamptz not null default now(),
  ip_address text
);
-- Ensure foreign keys have ON DELETE CASCADE for existing deployments
do $$ begin if exists (
  select 1
  from pg_constraint
  where conname = 'payment_consents_user_id_fkey'
    and conrelid = 'public.payment_consents'::regclass
) then
alter table payment_consents drop constraint payment_consents_user_id_fkey;
alter table payment_consents
add constraint payment_consents_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
end if;
if exists (
  select 1
  from pg_constraint
  where conname = 'payment_consents_payment_id_fkey'
    and conrelid = 'public.payment_consents'::regclass
) then
alter table payment_consents drop constraint payment_consents_payment_id_fkey;
alter table payment_consents
add constraint payment_consents_payment_id_fkey foreign key (payment_id) references payments(id) on delete cascade;
end if;
end $$;
alter table payment_consents enable row level security;
drop policy if exists "Users can view their own consents" on payment_consents;
create policy "Users can view their own consents" on payment_consents for
select using (auth.uid () = user_id);
-- Consents are written server-side by the privileged payment handler
drop policy if exists "Users can insert their own consents" on payment_consents;
grant all on public.payment_consents to service_role;
revoke
insert,
  update,
  delete on public.payment_consents
from authenticated;
grant select on public.payment_consents to authenticated;
-- ============================================
-- PAYMENT CALLBACK: ATOMIC SUBSCRIPTION GRANT
-- ============================================
-- First drop any existing versions to avoid function overloading
drop function if exists grant_subscription_and_mark_paid (uuid, bigint, int, text, text);
drop function if exists grant_subscription_and_mark_paid (uuid, uuid, int, text, text);
create or replace function grant_subscription_and_mark_paid (
    p_user_id uuid,
    p_payment_id bigint,
    p_plan_months int,
    p_card_uuid text default null,
    p_transaction_id text default null
  ) returns void as $$
declare base_date timestamptz;
current_expiry timestamptz;
target_expiry timestamptz;
original_day int;
begin -- Get current subscription expiry
select subscription_expires_at into current_expiry
from profiles
where id = p_user_id for
update;
-- Lock the row to prevent concurrent updates
-- Calculate base date: if subscription is still valid, extend from there; otherwise use now
if current_expiry is not null
and current_expiry > now() then base_date := current_expiry;
else base_date := now();
end if;
-- Calculate target expiry date (handle month-end rollover)
original_day := extract(
  day
  from base_date
);
target_expiry := base_date + (p_plan_months || ' months')::interval;
-- If the day of month decreased (e.g., Jan 31 -> Feb 28), we rolled back to previous month end
-- This is correct behavior, but ensure we don't go backward
if extract(
  day
  from target_expiry
) < original_day then -- PostgreSQL already handles this correctly by rolling to month end
-- No additional adjustment needed
end if;
-- Update profile with subscription and optionally card info
update profiles
set is_subscribed = true,
  subscription_expires_at = target_expiry
where id = p_user_id;
-- Mark payment as paid
update payments
set status = 'paid',
  payriff_transaction_id = p_transaction_id
where id = p_payment_id;
end;
$$ language plpgsql security definer;
revoke execute on function grant_subscription_and_mark_paid (uuid, bigint, int, text, text)
from public,
  authenticated;
grant execute on function grant_subscription_and_mark_paid (uuid, bigint, int, text, text) to service_role;
-- ============================================
-- NOTIFICATION LOGS TABLE
-- ============================================
create table if not exists notification_logs (
  id uuid primary key default gen_random_uuid (),
  user_id uuid references auth.users (id) on delete cascade not null,
  type text not null,
  template text not null,
  sent_at timestamptz default now(),
  status text not null,
  error_message text
);
alter table notification_logs enable row level security;
drop policy if exists "Service role can manage notification logs" on notification_logs;
create policy "Service role can manage notification logs" on notification_logs for all using (true);
grant all on public.notification_logs to service_role;
revoke all on public.notification_logs
from authenticated;
-- ============================================
-- FUNCTION: GET USERS WITH EXPIRING SUBSCRIPTIONS
-- ============================================
drop function if exists get_expiring_subscriptions (int);
create or replace function get_expiring_subscriptions (days_threshold int default 7) returns table (
    user_id uuid,
    email text,
    phone text,
    full_name text,
    subscription_expires_at timestamptz,
    days_until_expiry int,
    last_duration_type text,
    last_periods int
  ) language plpgsql security definer
set search_path = public,
  pg_temp as $$ begin return query
select p.id as user_id,
  p.email,
  p.phone,
  p.full_name,
  p.subscription_expires_at,
  extract(
    day
    from (p.subscription_expires_at - now())
  )::int as days_until_expiry,
  p.last_duration_type,
  p.last_periods
from profiles p
where p.is_subscribed = true
  and p.subscription_expires_at is not null
  and p.subscription_expires_at > now()
  and p.subscription_expires_at <= now() + (days_threshold || ' days')::interval
  and not exists (
    select 1
    from notification_logs nl
    where nl.user_id = p.id
      and nl.template = 'subscription_expiring'
      and nl.sent_at > now() - interval '24 hours'
  );
end;
$$;
revoke execute on function get_expiring_subscriptions (int)
from public,
  authenticated;
grant execute on function get_expiring_subscriptions (int) to service_role;
-- ============================================
-- FUNCTION: GET SUBSCRIPTION INFO FOR USER
-- ============================================
drop function if exists get_subscription_info ();
create or replace function get_subscription_info () returns table (
    is_subscribed boolean,
    subscription_expires_at timestamptz,
    days_remaining int,
    is_expired boolean
  ) language plpgsql security definer
set search_path = public,
  pg_temp as $$ begin return query
select p.is_subscribed,
  p.subscription_expires_at,
  case
    when p.subscription_expires_at is null then null
    when p.subscription_expires_at > now() then extract(
      day
      from (p.subscription_expires_at - now())
    )::int
    else 0
  end as days_remaining,
  case
    when p.subscription_expires_at is null then false
    when p.subscription_expires_at <= now() then true
    else false
  end as is_expired
from profiles p
where p.id = auth.uid();
end;
$$;
revoke execute on function get_subscription_info ()
from public,
  authenticated;
grant execute on function get_subscription_info () to authenticated;