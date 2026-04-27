import { describe, it, expect } from 'vitest'
import { calculateAvailable, calculateDays, calculateTotal } from '../availability'

describe('calculateDays', () => {
  it('counts both start and end day', () => {
    expect(calculateDays('2025-05-10', '2025-05-12')).toBe(3)
  })
  it('returns 1 for same-day rental', () => {
    expect(calculateDays('2025-05-10', '2025-05-10')).toBe(1)
  })
})

describe('calculateAvailable', () => {
  it('returns full stock when nothing is booked', () => {
    expect(calculateAvailable(20, [])).toBe(20)
  })
  it('subtracts booked quantity', () => {
    expect(calculateAvailable(20, [{ quantity: 5 }, { quantity: 3 }])).toBe(12)
  })
  it('never returns negative', () => {
    expect(calculateAvailable(5, [{ quantity: 8 }])).toBe(0)
  })
})

describe('calculateTotal', () => {
  it('multiplies price × quantity × days', () => {
    expect(calculateTotal([{ pricePerDay: 10, quantity: 2 }], '2025-05-10', '2025-05-12')).toBe(60)
  })
  it('sums multiple items', () => {
    expect(
      calculateTotal(
        [{ pricePerDay: 10, quantity: 2 }, { pricePerDay: 5, quantity: 4 }],
        '2025-05-10', '2025-05-10'
      )
    ).toBe(40)
  })
})
