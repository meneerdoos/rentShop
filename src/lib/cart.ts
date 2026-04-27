export interface CartItem {
  articleId: string
  slug: string
  nameNl: string
  nameEn: string
  pricePerDay: number
  quantity: number
  imageUrl: string
}

export interface Cart {
  items: CartItem[]
  startDate: string
  endDate: string
}

const CART_KEY = 'rental_cart'

export function getCart(): Cart | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(CART_KEY)
  return raw ? (JSON.parse(raw) as Cart) : null
}

export function saveCart(cart: Cart): void {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY)
}

export function addToCart(item: CartItem, startDate: string, endDate: string): void {
  const cart = getCart()
  if (!cart) {
    saveCart({ items: [item], startDate, endDate })
    return
  }
  const existing = cart.items.find(i => i.articleId === item.articleId)
  if (existing) {
    existing.quantity = item.quantity
  } else {
    cart.items.push(item)
  }
  saveCart({ ...cart, startDate, endDate })
}

export function removeFromCart(articleId: string): void {
  const cart = getCart()
  if (!cart) return
  saveCart({ ...cart, items: cart.items.filter(i => i.articleId !== articleId) })
}
