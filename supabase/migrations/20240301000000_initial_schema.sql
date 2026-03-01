-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Workspaces
create table workspaces (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid references auth.users(id) not null,
  plan text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Workspace Members
create table workspace_members (
  workspace_id uuid references workspaces(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('admin', 'member', 'viewer')),
  primary key (workspace_id, user_id)
);

-- Jobs
create table jobs (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  title text not null,
  description text not null,
  requirements text[] default '{}',
  created_by uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Candidates
create table candidates (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade not null,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  name text not null,
  email text,
  match_score integer default 0,
  anonymized_score integer,
  stage text default 'Screened' check (stage in ('Screened', 'Interview Scheduled', 'Final Round', 'Offer Extended', 'Rejected')),
  skills text[] default '{}',
  current_role text,
  resume_url text,
  raw_analysis jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Analyses (for batch comparison history, etc)
create table analyses (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid references candidates(id) on delete cascade not null,
  job_id uuid references jobs(id) on delete cascade not null,
  scores jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Job Weights (for bias and priority adjustments)
create table job_weights (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade not null,
  keyword text not null,
  weight integer not null default 50 check (weight between 0 and 100),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (job_id, keyword)
);

-- Candidate Comments
create table candidate_comments (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid references candidates(id) on delete cascade not null,
  author_id uuid references auth.users(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Candidate Votes
create table candidate_votes (
  candidate_id uuid references candidates(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  vote text not null check (vote in ('up', 'down')),
  primary key (candidate_id, user_id)
);

-- Bias Audit Logs
create table bias_audit_logs (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid references candidates(id) on delete cascade not null,
  original_score integer not null,
  anonymized_score integer not null,
  delta integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policy templates (Optional but recommended)
-- Example: 
-- alter table workspaces enable row level security;
-- create policy "Users can view workspaces they belong to" on workspaces
--   for select using (
--     id in (select workspace_id from workspace_members where user_id = auth.uid())
--     or owner_id = auth.uid()
--   );
