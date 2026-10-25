-- Public pages need only show the item's public supporters and vote counts.
-- Remove broad privileges first; RLS alone does not constrain TRUNCATE or TRIGGER.
REVOKE ALL PRIVILEGES ON TABLE public.contributions FROM anon, authenticated;
GRANT SELECT (item_id, username, amount_cents, created_at)
  ON TABLE public.contributions TO anon;