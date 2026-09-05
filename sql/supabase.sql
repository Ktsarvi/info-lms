-- ============================================
-- MIGRATIONS (idempotent — safe against any prior schema state)
-- ============================================
do $$ begin if exists (
  select 1
  from information_schema.columns
  where table_name = 'profiles'
    and column_name = 'card_id'
)
and not exists (
  select 1
  from information_schema.columns
  where table_name = 'profiles'
    and column_name = 'card_uuid'
) then
alter table profiles
  rename column card_id to card_uuid;
end if;
end $$;

do $$ begin if exists (
  select 1
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'payments'
    and column_name = 'kapital_order_id'
) then
  alter table public.payments alter column kapital_order_id drop not null;
end if;
end $$;

-- ============================================
-- PROFILES TABLE
-- ============================================
create table if not exists profiles (
  id uuid references auth.users (id) primary key,
  email text,
  full_name text,
  is_subscribed boolean default false,
  subscription_expires_at timestamptz,
  card_uuid text,
  auto_renew boolean not null default true,
  renewal_attempt_count int not null default 0,
  last_renewal_attempt_at timestamptz,
  created_at timestamptz default now()
);

-- Ensures these columns exist even if `profiles` already existed before this
-- script ran (the create table above is a no-op in that case).
alter table profiles
add column if not exists card_uuid text;

alter table profiles
add column if not exists auto_renew boolean not null default true;

alter table profiles
add column if not exists renewal_attempt_count int not null default 0;

alter table profiles
add column if not exists last_renewal_attempt_at timestamptz;

alter table profiles enable row level security;

drop policy if exists "Users can view their own profile" on profiles;

create policy "Users can view their own profile" on profiles for
select
  using (auth.uid () = id);

drop policy if exists "Users can update their own profile" on profiles;

create policy "Users can update their own profile" on profiles
for update
  using (auth.uid () = id);

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP (captures full_name now)
-- ============================================
create or replace function public.handle_new_user () returns trigger as $$ begin
insert into public.profiles (id, email, full_name)
values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users for each row
execute procedure public.handle_new_user ();

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
select
  using (
    exists (
      select
        1
      from
        profiles
      where
        profiles.id = auth.uid ()
        and profiles.is_subscribed = true
        and (
          profiles.subscription_expires_at is null
          or profiles.subscription_expires_at > now()
        )
    )
  );

drop policy if exists "Subscribed users can view sub_lessons" on sub_lessons;

create policy "Subscribed users can view sub_lessons" on sub_lessons for
select
  using (
    exists (
      select
        1
      from
        profiles
      where
        profiles.id = auth.uid ()
        and profiles.is_subscribed = true
        and (
          profiles.subscription_expires_at is null
          or profiles.subscription_expires_at > now()
        )
    )
  );

drop policy if exists "Subscribed users can view sub_lesson_files" on sub_lesson_files;

create policy "Subscribed users can view sub_lesson_files" on sub_lesson_files for
select
  using (
    exists (
      select
        1
      from
        profiles
      where
        profiles.id = auth.uid ()
        and profiles.is_subscribed = true
        and (
          profiles.subscription_expires_at is null
          or profiles.subscription_expires_at > now()
        )
    )
  );

drop policy if exists "Subscribed users can view topic_files" on topic_files;

create policy "Subscribed users can view topic_files" on topic_files for
select
  using (
    exists (
      select
        1
      from
        profiles
      where
        profiles.id = auth.uid ()
        and profiles.is_subscribed = true
        and (
          profiles.subscription_expires_at is null
          or profiles.subscription_expires_at > now()
        )
    )
  );

drop policy if exists "Subscribed users can view exams" on exams;

create policy "Subscribed users can view exams" on exams for
select
  using (
    exists (
      select
        1
      from
        profiles
      where
        profiles.id = auth.uid ()
        and profiles.is_subscribed = true
        and (
          profiles.subscription_expires_at is null
          or profiles.subscription_expires_at > now()
        )
    )
  );

drop policy if exists "Subscribed users can view exam_files" on exam_files;

create policy "Subscribed users can view exam_files" on exam_files for
select
  using (
    exists (
      select
        1
      from
        profiles
      where
        profiles.id = auth.uid ()
        and profiles.is_subscribed = true
        and (
          profiles.subscription_expires_at is null
          or profiles.subscription_expires_at > now()
        )
    )
  );

drop policy if exists "Subscribed users can view exam_topics" on exam_topics;

create policy "Subscribed users can view exam_topics" on exam_topics for
select
  using (
    exists (
      select
        1
      from
        profiles
      where
        profiles.id = auth.uid ()
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
select
  using (
    bucket_id = 'courses'
    and exists (
      select
        1
      from
        profiles
      where
        profiles.id = auth.uid ()
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

grant
select
,
update on public.profiles to authenticated;

grant
select
  on public.topics to authenticated;

grant
select
  on public.sub_lessons to authenticated;

grant
select
  on public.sub_lesson_files to authenticated;

grant
select
  on public.topic_files to authenticated;

grant
select
  on public.exams to authenticated;

grant
select
  on public.exam_files to authenticated;

grant
select
  on public.exam_topics to authenticated;

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
select
  using (auth.uid () = user_id);

drop policy if exists "Users can insert their own progress" on user_progress;

create policy "Users can insert their own progress" on user_progress for insert
with
  check (auth.uid () = user_id);

drop policy if exists "Users can delete their own progress" on user_progress;

create policy "Users can delete their own progress" on user_progress for delete using (auth.uid () = user_id);

grant
select
,
  insert,
  delete on public.user_progress to authenticated;

-- payment
create table if not exists payments (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) not null,
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

alter table payments enable row level security;

drop policy if exists "Users can view their own payments" on payments;

create policy "Users can view their own payments" on payments for
select
  using (auth.uid () = user_id);

-- Client insert/update policies dropped to prevent tampering with financial state
drop policy if exists "Users can insert their own payments" on payments;

drop policy if exists "Users can update their own payments" on payments;

grant all on public.payments to service_role;

drop policy if exists "Service role can update payments" on payments;

create policy "Service role can update payments" on payments
for update
  using (true);

-- Authenticated users may only read their own payments; all writes must go through privileged server-side clients
revoke insert,
update,
delete on public.payments
from
  authenticated;

grant
select
  on public.payments to authenticated;

-- ============================================
-- PAYMENT CONSENTS: TERMS & PRIVACY ACCEPTANCE
-- ============================================
create table if not exists payment_consents (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) not null,
  payment_id bigint references payments (id) not null,
  terms_revision text not null,
  privacy_revision text not null,
  consented_at timestamptz not null default now(),
  ip_address text
);

alter table payment_consents enable row level security;

drop policy if exists "Users can view their own consents" on payment_consents;

create policy "Users can view their own consents" on payment_consents for
select
  using (auth.uid () = user_id);

-- Consents are written server-side by the privileged payment handler
drop policy if exists "Users can insert their own consents" on payment_consents;

grant all on public.payment_consents to service_role;

revoke insert,
update,
delete on public.payment_consents
from
  authenticated;

grant
select
  on public.payment_consents to authenticated;

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
  subscription_expires_at = target_expiry,
  card_uuid = coalesce(p_card_uuid, card_uuid),
  auto_renew = case
    when p_card_uuid is not null then true
    else auto_renew
  end
where id = p_user_id;
-- Mark payment as paid
update payments
set status = 'paid',
  payriff_transaction_id = p_transaction_id
where id = p_payment_id;
end;
$$ language plpgsql security definer;

revoke
execute on function grant_subscription_and_mark_paid (uuid, bigint, int, text, text)
from
  public,
  authenticated;

grant
execute on function grant_subscription_and_mark_paid (uuid, bigint, int, text, text) to service_role;

-- ============================================
-- RENEWALS: DUE-FOR-RENEWAL LOOKUP (Atomic claim)
-- ============================================
drop function if exists get_due_renewals ();

create or replace function get_due_renewals () returns table (
  user_id uuid,
  card_uuid text,
  amount numeric,
  plan_months int
) language plpgsql security definer
set
  search_path = public,
  pg_temp as $$
begin
  return query
  with candidates as (
    select p.id
    from profiles p
    where p.auto_renew = true
      and p.card_uuid is not null
      and p.subscription_expires_at <= now() + interval '1 day'
      and p.subscription_expires_at > now() - interval '3 days'
      and (
        p.last_renewal_attempt_at is null
        or p.last_renewal_attempt_at < current_date
      )
      and exists (
        select 1 from payments pay
        where pay.user_id = p.id and pay.status = 'paid'
      )
    for update skip locked
  ),
  claimed as (
    update profiles
    set last_renewal_attempt_at = now()
    from candidates
    where profiles.id = candidates.id
    returning profiles.id, profiles.card_uuid
  )
  select c.id,
    c.card_uuid,
    pay.amount,
    pay.plan_months
  from claimed c
    join lateral (
      select p.amount,
        p.plan_months
      from payments p
      where p.user_id = c.id
        and p.status = 'paid'
      order by p.created_at desc
      limit 1
    ) pay on true;
end;
$$;

revoke
execute on function get_due_renewals ()
from
  public,
  authenticated;

grant
execute on function get_due_renewals () to service_role;