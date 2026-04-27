export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

export function calculateAvailable(
  stockQuantity: number,
  bookedItems: { quantity: number }[]
): number {
  const totalBooked = bookedItems.reduce((sum, item) => sum + item.quantity, 0)
  return Math.max(0, stockQuantity - totalBooked)
}

export function calculateTotal(
  items: { pricePerDay: number; quantity: number }[],
  startDate: string,
  endDate: string
): number {
  const days = calculateDays(startDate, endDate)
  return items.reduce((sum, item) => sum + item.pricePerDay * item.quantity * days, 0)
}
