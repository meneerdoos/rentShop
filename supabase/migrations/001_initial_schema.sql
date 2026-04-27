CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_nl text NOT NULL,
  name_en text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE articles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id uuid NOT NULL REFERENCES categories(id),
  name_nl text NOT NULL,
  name_en text NOT NULL,
  description_nl text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  price_per_day numeric(10,2) NOT NULL,
  stock_quantity integer NOT NULL DEFAULT 0,
  image_url text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN ('pending_payment', 'confirmed', 'cancelled')),
  total_price numeric(10,2) NOT NULL,
  stripe_payment_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES articles(id),
  quantity integer NOT NULL,
  price_per_day numeric(10,2) NOT NULL
);

CREATE OR REPLACE FUNCTION get_available_quantity(
  p_article_id uuid,
  p_start_date date,
  p_end_date date
) RETURNS integer AS $$
DECLARE
  v_stock integer;
  v_booked integer;
BEGIN
  SELECT stock_quantity INTO v_stock FROM articles WHERE id = p_article_id;
  SELECT COALESCE(SUM(oi.quantity), 0) INTO v_booked
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  WHERE oi.article_id = p_article_id
    AND o.status = 'confirmed'
    AND o.start_date <= p_end_date
    AND o.end_date >= p_start_date;
  RETURN GREATEST(0, v_stock - v_booked);
END;
$$ LANGUAGE plpgsql;

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_categories" ON categories FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_articles" ON articles FOR SELECT TO anon USING (active = true);
CREATE POLICY "admin_all_categories" ON categories TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_articles" ON articles TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_orders" ON orders TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_order_items" ON order_items TO authenticated USING (true) WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('article-images', 'article-images', true);
CREATE POLICY "public_read_images" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'article-images');
CREATE POLICY "admin_upload_images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'article-images');
CREATE POLICY "admin_delete_images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'article-images');
