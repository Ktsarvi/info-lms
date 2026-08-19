-- ============================================
-- PROFILES TABLE
-- ============================================
create table profiles (
    id uuid references auth.users(id) primary key,
    email text,
    full_name text,
    is_subscribed boolean default false,
    subscription_expires_at timestamptz,
    created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users can view their own profile" on profiles for
select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles for
update using (auth.uid() = id);
-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP (captures full_name now)
-- ============================================
create function public.handle_new_user() returns trigger as $$ begin
insert into public.profiles (id, email, full_name)
values (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name'
    );
return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
after
insert on auth.users for each row execute procedure public.handle_new_user();

# courses
create table topics (
  id uuid primary key default gen_random_uuid(),
  order_index integer not null,
  slug text unique not null,
  title text not null,
  description text,
  created_at timestamptz default now()
);

create table sub_lessons (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete cascade not null,
  order_index integer not null,
  title text not null,
  created_at timestamptz default now()
);

create type sub_lesson_file_type as enum ('theory', 'test');

create table sub_lesson_files (
  id uuid primary key default gen_random_uuid(),
  sub_lesson_id uuid references sub_lessons(id) on delete cascade not null,
  file_type sub_lesson_file_type not null,
  storage_path text not null,
  original_filename text not null,
  created_at timestamptz default now()
);

create table topic_files (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete cascade not null,
  storage_path text not null,
  original_filename text not null,
  title text,
  created_at timestamptz default now()
);

create table exams (
  id uuid primary key default gen_random_uuid(),
  order_index integer not null,
  title text not null,
  created_at timestamptz default now()
);

create type exam_file_type as enum ('exam', 'answer_key');

create table exam_files (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references exams(id) on delete cascade not null,
  file_type exam_file_type not null,
  storage_path text not null,
  original_filename text not null,
  created_at timestamptz default now()
);

create table exam_topics (
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

create policy "Subscribed users can view topics" on topics for select
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_subscribed = true));
create policy "Subscribed users can view sub_lessons" on sub_lessons for select
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_subscribed = true));
create policy "Subscribed users can view sub_lesson_files" on sub_lesson_files for select
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_subscribed = true));
create policy "Subscribed users can view topic_files" on topic_files for select
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_subscribed = true));
create policy "Subscribed users can view exams" on exams for select
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_subscribed = true));
create policy "Subscribed users can view exam_files" on exam_files for select
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_subscribed = true));
create policy "Subscribed users can view exam_topics" on exam_topics for select
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_subscribed = true));

-- other query

create policy "Subscribed users can read course files"
on storage.objects for select
using (
  bucket_id = 'courses'
  and exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.is_subscribed = true
  )
);

#grants
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant select, update on public.profiles to authenticated;
grant select on public.topics to authenticated;
grant select on public.sub_lessons to authenticated;
grant select on public.sub_lesson_files to authenticated;
grant select on public.topic_files to authenticated;
grant select on public.exams to authenticated;
grant select on public.exam_files to authenticated;
grant select on public.exam_topics to authenticated;
grant select, insert, delete on public.user_progress to authenticated;

# progress
create table user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  file_id uuid not null,              -- id from sub_lesson_files, topic_files, or exam_files
  file_table text not null,            -- 'sub_lesson_files' | 'topic_files' | 'exam_files'
  completed_at timestamptz default now(),
  unique (user_id, file_id, file_table)
);

alter table user_progress enable row level security;

create policy "Users can view their own progress"
  on user_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert their own progress"
  on user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own progress"
  on user_progress for delete
  using (auth.uid() = user_id);

grant select, insert, delete on public.user_progress to authenticated;