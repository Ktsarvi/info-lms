-- ============================================
-- PROFILES TABLE
-- ============================================
create table if not exists profiles (
  id uuid references auth.users(id) primary key,
  email text,
  full_name text,
  is_subscribed boolean default false,
  subscription_expires_at timestamptz,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
drop policy if exists "Users can view their own profile" on profiles;
create policy "Users can view their own profile" on profiles for
select using (auth.uid() = id);
drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile" on profiles for
update using (auth.uid() = id);
-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP (captures full_name now)
-- ============================================
create or replace function public.handle_new_user() returns trigger as $$ begin
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
after
insert on auth.users for each row execute procedure public.handle_new_user();
-- courses
create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  order_index integer not null,
  slug text unique not null,
  title text not null,
  description text,
  created_at timestamptz default now()
);
create table if not exists sub_lessons (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete cascade not null,
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
  id uuid primary key default gen_random_uuid(),
  sub_lesson_id uuid references sub_lessons(id) on delete cascade not null,
  file_type sub_lesson_file_type not null,
  storage_path text not null,
  original_filename text not null,
  created_at timestamptz default now()
);
create table if not exists topic_files (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete cascade not null,
  storage_path text not null,
  original_filename text not null,
  title text,
  created_at timestamptz default now()
);
create table if not exists exams (
  id uuid primary key default gen_random_uuid(),
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
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references exams(id) on delete cascade not null,
  file_type exam_file_type not null,
  storage_path text not null,
  original_filename text not null,
  created_at timestamptz default now()
);
create table if not exists exam_topics (
  exam_id uuid references exams(id) on delete cascade not null,
  topic_id uuid references topics(id) on delete cascade not null,
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
      where profiles.id = auth.uid()
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
      where profiles.id = auth.uid()
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
      where profiles.id = auth.uid()
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
      where profiles.id = auth.uid()
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
      where profiles.id = auth.uid()
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
      where profiles.id = auth.uid()
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
      where profiles.id = auth.uid()
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
      where profiles.id = auth.uid()
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
grant select on public.profiles to authenticated;
grant update (email, full_name) on public.profiles to authenticated;
grant select on public.topics to authenticated;
grant select on public.sub_lessons to authenticated;
grant select on public.sub_lesson_files to authenticated;
grant select on public.topic_files to authenticated;
grant select on public.exams to authenticated;
grant select on public.exam_files to authenticated;
grant select on public.exam_topics to authenticated;
-- progress
create table if not exists user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
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
select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own progress" on user_progress;
create policy "Users can insert their own progress" on user_progress for
insert with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own progress" on user_progress;
create policy "Users can delete their own progress" on user_progress for delete using (auth.uid() = user_id);
grant select,
  insert,
  delete on public.user_progress to authenticated;
-- payment
create table if not exists payments (
  id bigint generated always as identity primary key,
  kapital_order_id bigint not null unique,
  user_id uuid references auth.users(id) not null,
  amount numeric not null,
  currency text not null default 'AZN',
  plan_months int not null,
  -- how many months this purchase extends
  status text not null default 'pending',
  -- pending | paid | failed
  created_at timestamptz default now()
);
alter table payments enable row level security;
drop policy if exists "Users can view their own payments" on payments;
create policy "Users can view their own payments" on payments for
select using (auth.uid() = user_id);
grant all on public.payments to service_role;
grant select,
  insert on public.payments to authenticated;