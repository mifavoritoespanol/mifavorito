-- Associate every contest entry with its country of origin.
ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS country_code text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'items_country_code_format'
      AND conrelid = 'public.items'::regclass
  ) THEN
    ALTER TABLE public.items
      ADD CONSTRAINT items_country_code_format
      CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$');
  END IF;
END $$;

-- Store a permanent, idempotent snapshot of each closed election's podium.
CREATE TABLE IF NOT EXISTS public.country_election_points (
  election_key text NOT NULL,
  category_slug text NOT NULL,
  item_id bigint NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  country_code text NOT NULL CHECK (country_code ~ '^[A-Z]{2}$'),
  placement smallint NOT NULL CHECK (placement BETWEEN 1 AND 3),
  points smallint NOT NULL CHECK (points IN (1, 3, 5)),
  finalized_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (election_key, item_id),
  CHECK (
    (placement = 1 AND points = 5) OR
    (placement = 2 AND points = 3) OR
    (placement = 3 AND points = 1)
  )
);

ALTER TABLE public.country_election_points ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Country election points are public" ON public.country_election_points;
CREATE POLICY "Country election points are public"
  ON public.country_election_points FOR SELECT
  TO anon, authenticated USING (true);
GRANT SELECT ON public.country_election_points TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.finalize_country_election(
  p_election_key text,
  p_category_slug text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_election_key, 0));

  IF EXISTS (
    SELECT 1 FROM public.country_election_points
    WHERE election_key = p_election_key
  ) THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.items AS i
    JOIN public.categories AS c ON c.id = i.category_id
    WHERE c.slug = p_category_slug
      AND i.status IS DISTINCT FROM 'pending'
      AND i.country_code IS NULL
  ) THEN
    RAISE EXCEPTION 'Every approved item needs a country before results are finalized.';
  END IF;

  INSERT INTO public.country_election_points (
    election_key, category_slug, item_id, country_code, placement, points
  )
  SELECT
    p_election_key,
    p_category_slug,
    ranked.id,
    ranked.country_code,
    ranked.placement,
    CASE ranked.placement WHEN 1 THEN 5 WHEN 2 THEN 3 ELSE 1 END
  FROM (
    SELECT
      i.id,
      i.country_code,
      (rank() OVER (ORDER BY i.total_cents DESC))::smallint AS placement
    FROM public.items AS i
    JOIN public.categories AS c ON c.id = i.category_id
    WHERE c.slug = p_category_slug
      AND i.status IS DISTINCT FROM 'pending'
      AND i.country_code IS NOT NULL
  ) AS ranked
  WHERE ranked.placement <= 3
  ON CONFLICT (election_key, item_id) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.finalize_country_election(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_country_election(text, text) TO service_role;
