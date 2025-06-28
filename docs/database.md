# Database Schema Documentation

This document outlines the database schema for the Threadist application, including table structures and seeding scripts.

## Table Structure

### 1. Interest Categories (`interest_categories`)
Stores the main interest categories that users can select from.

### 2. Category Subreddits (`category_subreddits`)
Bridge table that maps subreddits to interest categories.

### 3. User Interests (`user_interests`)
Stores user-selected interests with weights and references to category subreddits.

## Schema Creation Script

```sql
-- interest_categories
create table public.interest_categories (
  category_id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label text not null,
  emoji text,
  description text
);

-- category_subreddits
create table public.category_subreddits (
  csid uuid primary key default gen_random_uuid(),
  category_id uuid references public.interest_categories(category_id) on delete cascade,
  subreddit text not null
);

-- user_interests
create table public.user_interests (
  interest_id uuid primary key default gen_random_uuid(),
  csid uuid references public.category_subreddits(csid) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  weight int not null default 1
);

-- Row-Level Security for user_interests
alter table public.user_interests enable row level security;
create policy "users manage their own interests"
  on public.user_interests
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

## Data Seeding Script

```sql
-- ========== 1. Seed interest_categories ==========

insert into public.interest_categories (slug, label, emoji, description) values
  ('stories-humor',  'Stories & Humor',         '🔥', 'AskReddit, TIFU and other high-engagement storytellers'),
  ('horror',         'Horror',                 '👻', 'Creepy and suspenseful tales'),
  ('relationships',  'Relationships & Morality','❤️','AITA, relationship advice and moral dilemmas'),
  ('mindblown',      'Mind-blowing Facts',      '🤯', 'Facts and mysteries that make you say "wow"'),
  ('self-help',      'Life & Self-Help',        '💡', 'Motivation, personal finance, self-improvement'),
  ('pop-culture',    'Pop-Culture Fandom',      '🎬', 'Movies, TV, anime and gaming communities');

-- ========== 2. Seed category_subreddits (bridge rows) ==========

-- Stories & Humor
insert into public.category_subreddits (category_id, subreddit) select category_id, 'AskReddit'
  from public.interest_categories where slug = 'stories-humor';
insert into public.category_subreddits (category_id, subreddit) select category_id, 'TIFU'
  from public.interest_categories where slug = 'stories-humor';
insert into public.category_subreddits (category_id, subreddit) select category_id, 'IAmA'
  from public.interest_categories where slug = 'stories-humor';
insert into public.category_subreddits (category_id, subreddit) select category_id, 'funny'
  from public.interest_categories where slug = 'stories-humor';

-- Horror
insert into public.category_subreddits (category_id, subreddit) select category_id, 'nosleep'
  from public.interest_categories where slug = 'horror';
insert into public.category_subreddits (category_id, subreddit) select category_id, 'creepypasta'
  from public.interest_categories where slug = 'horror';
insert into public.category_subreddits (category_id, subreddit) select category_id, 'truehorrorstories'
  from public.interest_categories where slug = 'horror';

-- Relationships & Morality
insert into public.category_subreddits (category_id, subreddit) select category_id, 'AmItheAsshole'
  from public.interest_categories where slug = 'relationships';
insert into public.category_subreddits (category_id, subreddit) select category_id, 'relationship_advice'
  from public.interest_categories where slug = 'relationships';
insert into public.category_subreddits (category_id, subreddit) select category_id, 'confessions'
  from public.interest_categories where slug = 'relationships';

-- Mind-blowing Facts
insert into public.category_subreddits (category_id, subreddit) select category_id, 'todayilearned'
  from public.interest_categories where slug = 'mindblown';
insert into public.category_subreddits (category_id, subreddit) select category_id, 'unresolvedmysteries'
  from public.interest_categories where slug = 'mindblown';
insert into public.category_subreddits (category_id, subreddit) select category_id, 'Unexplained'
  from public.interest_categories where slug = 'mindblown';

-- Life & Self-Help
insert into public.category_subreddits (category_id, subreddit) select category_id, 'selfimprovement'
  from public.interest_categories where slug = 'self-help';
insert into public.category_subreddits (category_id, subreddit) select category_id, 'GetMotivated'
  from public.interest_categories where slug = 'self-help';
insert into public.category_subreddits (category_id, subreddit) select category_id, 'personalfinance'
  from public.interest_categories where slug = 'self-help';

-- Pop-Culture Fandom
insert into public.category_subreddits (category_id, subreddit) select category_id, 'movies'
  from public.interest_categories where slug = 'pop-culture';
insert into public.category_subreddits (category_id, subreddit) select category_id, 'Severance'
  from public.interest_categories where slug = 'pop-culture';
insert into public.category_subreddits (category_id, subreddit) select category_id, 'anime'
  from public.interest_categories where slug = 'pop-culture';
```

## Table Relationships

- `interest_categories` → `category_subreddits` (one-to-many)
- `category_subreddits` → `user_interests` (one-to-many)
- `auth.users` → `user_interests` (one-to-many)

## Security

Row-Level Security (RLS) is enabled on the `user_interests` table to ensure users can only access and modify their own interest data.

## Usage

1. Run the schema creation script first to create the tables
2. Run the data seeding script to populate the initial interest categories and subreddits
3. Users will create entries in `user_interests` when they select their interests in the app
