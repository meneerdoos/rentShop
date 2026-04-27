import { describe, it, expect, beforeEach } from 'vitest'
import { getCart, clearCart, addToCart, removeFromCart } from '../cart'

const mockItem = {
  articleId: 'art-1',
  slug: 'art-1',
  nameNl: 'Ronde tafel',
  nameEn: 'Round table',
  pricePerDay: 12.5,
  quantity: 2,
  imageUrl: '',
}

beforeEach(() => clearCart())

describe('addToCart', () => {
  it('creates a new cart with one item', () => {
    addToCart(mockItem, '2025-05-10', '2025-05-12')
    const cart = getCart()
    expect(cart?.items).toHaveLength(1)
    expect(cart?.items[0].articleId).toBe('art-1')
  })

  it('updates quantity when adding same article', () => {
    addToCart(mockItem, '2025-05-10', '2025-05-12')
    addToCart({ ...mockItem, quantity: 5 }, '2025-05-10', '2025-05-12')
    expect(getCart()?.items[0].quantity).toBe(5)
  })

  it('adds a second distinct item', () => {
    addToCart(mockItem, '2025-05-10', '2025-05-12')
    addToCart({ ...mockItem, articleId: 'art-2' }, '2025-05-10', '2025-05-12')
    expect(getCart()?.items).toHaveLength(2)
  })
})

describe('removeFromCart', () => {
  it('removes item by articleId', () => {
    addToCart(mockItem, '2025-05-10', '2025-05-12')
    removeFromCart('art-1')
    expect(getCart()?.items).toHaveLength(0)
  })

  it('does nothing when cart is empty', () => {
    removeFromCart('art-1')
    expect(getCart()).toBeNull()
  })
})
