-- CutBase Database Schema with Row-Level Security (RLS)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: users (linked to Supabase auth or custom profiles)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique null,
  name text null,
  created_at timestamptz default now()
);

-- Table: analyses
create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null, -- references auth.users(id) dynamically via RLS
  claim_text text not null,
  evidence_text text null,
  source_url text null,
  
  -- Parsed source metadata / hints
  source_title text null,
  author_name text null,
  publication_name text null,
  published_at date null,
  topic_label text null,
  
  -- Scores (Normalized 1-10)
  source_credibility numeric not null,
  recency_fit numeric not null,
  specificity numeric not null,
  quote_integrity numeric not null,
  claim_fit numeric not null,
  attack_risk text not null check (attack_risk in ('low', 'medium', 'high')),
  overall_score numeric not null,
  confidence_level text not null check (confidence_level in ('low', 'medium', 'high')),
  
  -- Explanations & Suggestions
  one_line_verdict text not null,
  strongest_attribute text not null,
  biggest_weakness text not null,
  suggested_tag text not null,
  suggested_best_use text not null,
  explanations jsonb not null, 
  
  -- QA Disagreement Tracking
  flagged boolean default false,
  flagged_reason text null,
  tag_copied boolean default false,
  
  -- Auditing / Raw values
  raw_model_output jsonb not null,
  created_at timestamptz default now()
);

-- Indexing for speed
create index if not exists idx_analyses_user_id on analyses(user_id);
create index if not exists idx_analyses_created_at on analyses(created_at desc);

-- Table: comparisons
create table if not exists comparisons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null, -- references auth.users(id) dynamically via RLS
  analysis_a_id uuid references analyses(id) on delete cascade not null,
  analysis_b_id uuid references analyses(id) on delete cascade not null,
  winner_id uuid references analyses(id) on delete cascade not null,
  comparison_summary text not null,
  created_at timestamptz default now()
);

create index if not exists idx_comparisons_user_id on comparisons(user_id);
create index if not exists idx_comparisons_created_at on comparisons(created_at desc);


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on analyses
alter table analyses enable row level security;

-- Policy: Allow users to view their own analyses
create policy "Users can read own analyses"
  on analyses
  for select
  using (
    auth.uid() = user_id 
    or user_id is null -- allow reading mock records or guest records if not authenticated
  );

-- Policy: Allow users to insert their own analyses
create policy "Users can insert own analyses"
  on analyses
  for insert
  with check (
    auth.uid() = user_id
    or auth.uid() is null -- fallback check
  );

-- Policy: Allow users to update their own analyses (e.g. for flagging / copy tracking)
create policy "Users can update own analyses"
  on analyses
  for update
  using (
    auth.uid() = user_id
    or user_id is null
  );

-- Enable RLS on comparisons
alter table comparisons enable row level security;

-- Policy: Allow users to view their own comparisons
create policy "Users can read own comparisons"
  on comparisons
  for select
  using (
    auth.uid() = user_id
    or user_id is null
  );

-- Policy: Allow users to insert their own comparisons
create policy "Users can insert own comparisons"
  on comparisons
  for insert
  with check (
    auth.uid() = user_id
    or auth.uid() is null
  );
