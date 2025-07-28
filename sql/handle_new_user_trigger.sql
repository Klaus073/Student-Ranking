-- ---------------------------------------------------------------------
-- handle_new_user_trigger.sql
-- ---------------------------------------------------------------------
-- Creates the function and trigger that automatically transfers signup
-- metadata from auth.users into the student_* public tables.
--
-- Run this once (or after recreating tables) in the Supabase SQL Editor
-- or via psql/psql-cli:
--   \i path/to/handle_new_user_trigger.sql
-- ---------------------------------------------------------------------

-- 1. Function ----------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer                             -- bypass RLS using owner's rights
set search_path = public                     -- ensures we reference public tables
as $$
declare
  meta jsonb := new.raw_user_meta_data;
begin
  -- Idempotency: exit if profile already exists
  if exists (select 1 from student_profiles where user_id = new.id) then
    return new;
  end if;

  ---------------------------------------------------------------------
  -- Main profile ------------------------------------------------------
  ---------------------------------------------------------------------
  insert into student_profiles (
    user_id,
    full_name,
    current_year,
    university,
    grades,
    bank_internship_tier,
    industry_exposure,
    months_of_experience,
    awards,
    certifications
  ) values (
    new.id,
    coalesce(meta ->> 'full_name',        ''),
    (meta ->> 'current_year')::int,
    meta ->> 'university',
    meta ->> 'grades',
    meta ->> 'bank_internship_tier',
    meta ->> 'industry_exposure',
    coalesce((meta ->> 'months_of_experience')::int, 0),
    coalesce((meta ->> 'awards')::int,          0),
    coalesce((meta ->> 'certifications')::int, 0)
  ) on conflict do nothing;

  ---------------------------------------------------------------------
  -- A-levels ----------------------------------------------------------
  ---------------------------------------------------------------------
  if meta ? 'a_levels' then
    insert into student_alevels (user_id, subject)
    select new.id, value::text
    from jsonb_array_elements_text(meta -> 'a_levels') value
    on conflict do nothing;
  end if;

  ---------------------------------------------------------------------
  -- GCSEs -------------------------------------------------------------
  ---------------------------------------------------------------------
  if meta ? 'gcses' then
    insert into student_gcses (user_id, subject)
    select new.id, value::text
    from jsonb_array_elements_text(meta -> 'gcses') value
    on conflict do nothing;
  end if;

  ---------------------------------------------------------------------
  -- Internships -------------------------------------------------------
  ---------------------------------------------------------------------
  if meta ? 'internships' then
    insert into student_internships (user_id, tier, months, year)
    select new.id,
           i ->> 'tier',
           coalesce((i ->> 'months')::int, 0),
           coalesce((i ->> 'years')::int,  0)
    from jsonb_array_elements(meta -> 'internships') i
    where (i ->> 'tier') is not null
    on conflict do nothing;
  end if;

  ---------------------------------------------------------------------
  -- Society roles -----------------------------------------------------
  ---------------------------------------------------------------------
  if meta ? 'society_roles' then
    insert into student_society_roles (user_id, role_title, society_size, years_active)
    select new.id,
           s ->> 'role',
           lower(s ->> 'size'),           -- match CHECK constraint values
           coalesce((s ->> 'years')::int, 0)
    from jsonb_array_elements(meta -> 'society_roles') s
    where (s ->> 'role') is not null
    on conflict do nothing;
  end if;

  return new;
end;
$$;

-- 2. Trigger -----------------------------------------------------------
-- Drop any existing trigger of the same name to avoid duplicates.
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- END OF FILE
-- --------------------------------------------------------------------- 