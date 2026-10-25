alter table public.items drop constraint if exists items_wikipedia_url_valid;
alter table public.items add constraint items_wikipedia_url_valid
  check (
    wikipedia_url is null
    or wikipedia_url ~* '^https://([a-z]{2,3}\.)?wikipedia\.org/wiki/[^[:space:]]+$'
  );