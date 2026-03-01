  create table if not exists batch_analyses (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null,
    data jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
  );
