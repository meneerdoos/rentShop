-- Customer Stories / Events table
CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  event_type  TEXT NOT NULL,
  event_date  TEXT NOT NULL,
  location    TEXT NOT NULL,
  quote       TEXT NOT NULL,
  image_url   TEXT,
  item_ids    UUID[] NOT NULL DEFAULT '{}',
  hotspots    JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Public read access
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_public_read"
  ON events FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "events_admin_all"
  ON events FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
