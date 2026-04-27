export interface Category {
  id: string
  name_nl: string
  name_en: string
  slug: string
  sort_order: number
}

export interface Article {
  id: string
  category_id: string
  name_nl: string
  name_en: string
  description_nl: string
  description_en: string
  price_per_day: number
  stock_quantity: number
  image_url: string
  active: boolean
}

export interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  start_date: string
  end_date: string
  status: 'pending_payment' | 'confirmed' | 'cancelled'
  total_price: number
  stripe_payment_id: string | null
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  article_id: string
  quantity: number
  price_per_day: number
}
