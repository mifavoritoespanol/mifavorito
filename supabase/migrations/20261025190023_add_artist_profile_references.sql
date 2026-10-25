alter table public.items
  add column if not exists wikipedia_url text,
  add column if not exists info_summary text,
  add column if not exists grokipedia_url text;

alter table public.items
  add constraint items_wikipedia_url_valid
  check (
    wikipedia_url is null
    or wikipedia_url ~* '^https://([a-z]{2,3}\.)?wikipedia\.org/wiki/[^[:space:]]+$'
  );

create unique index if not exists items_wikipedia_url_unique
  on public.items (lower(wikipedia_url))
  where wikipedia_url is not null;

drop policy if exists "proponer item" on public.items;
create policy "proponer item"
  on public.items for insert
  to public
  with check (
    status = 'pending'
    and total_cents = 0
    and top_cents = 0
    and top_username is null
    and promo_text is null
    and promo_url is null
    and wikipedia_url is not null
    and info_summary is null
    and grokipedia_url is null
  );