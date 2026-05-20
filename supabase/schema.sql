-- PharmFlow Database Schema
-- Run this in the Supabase SQL editor

-- ─── Enums ────────────────────────────────────────────────────────────────────

create type question_type as enum ('multiple_choice', 'true_false', 'short_answer');
create type quiz_status as enum ('processing', 'ready', 'failed');

-- ─── Profiles ─────────────────────────────────────────────────────────────────

create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
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
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── Quizzes ──────────────────────────────────────────────────────────────────

create table if not exists quizzes (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  title           text not null,
  source_filename text not null,
  question_count  integer not null default 0,
  status          quiz_status not null default 'processing',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index quizzes_user_id_idx on quizzes(user_id);
create index quizzes_created_at_idx on quizzes(created_at desc);

alter table quizzes enable row level security;

create policy "Users can manage own quizzes"
  on quizzes for all
  using (auth.uid() = user_id);

-- ─── Questions ────────────────────────────────────────────────────────────────

create table if not exists questions (
  id             uuid primary key default gen_random_uuid(),
  quiz_id        uuid not null references quizzes(id) on delete cascade,
  question_text  text not null,
  question_type  question_type not null default 'multiple_choice',
  options        jsonb,             -- array of strings for MC / T-F
  correct_answer text not null,
  explanation    text,
  order_index    integer not null default 0,
  created_at     timestamptz not null default now()
);

create index questions_quiz_id_idx on questions(quiz_id);

alter table questions enable row level security;

create policy "Users can view questions of own quizzes"
  on questions for select
  using (
    exists (
      select 1 from quizzes
      where quizzes.id = questions.quiz_id
        and quizzes.user_id = auth.uid()
    )
  );

create policy "Service role can insert questions"
  on questions for insert
  with check (true);

-- ─── Quiz Attempts ────────────────────────────────────────────────────────────

create table if not exists quiz_attempts (
  id              uuid primary key default gen_random_uuid(),
  quiz_id         uuid not null references quizzes(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  score           integer,
  total_questions integer not null,
  answers         jsonb not null default '[]',
  completed_at    timestamptz,
  created_at      timestamptz not null default now()
);

create index quiz_attempts_user_id_idx on quiz_attempts(user_id);
create index quiz_attempts_quiz_id_idx on quiz_attempts(quiz_id);

alter table quiz_attempts enable row level security;

create policy "Users can manage own attempts"
  on quiz_attempts for all
  using (auth.uid() = user_id);

-- ─── Updated-at trigger ───────────────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger quizzes_updated_at
  before update on quizzes
  for each row execute procedure set_updated_at();

create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure set_updated_at();
