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