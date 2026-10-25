-- Restrict trigger and event-trigger helpers to their intended invocation paths.
REVOKE EXECUTE ON FUNCTION public.add_to_total() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- Keep SECURITY DEFINER name resolution confined to trusted schemas.
ALTER FUNCTION public.add_to_total() SET search_path = pg_catalog, public;

-- Index foreign-key columns used for joins and parent-row updates/deletes.
CREATE INDEX IF NOT EXISTS items_category_id_idx ON public.items (category_id);
CREATE INDEX IF NOT EXISTS contributions_item_id_idx ON public.contributions (item_id);
CREATE INDEX IF NOT EXISTS country_election_points_item_id_idx ON public.country_election_points (item_id);