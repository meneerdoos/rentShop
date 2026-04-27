'use client'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface StripePaymentFormProps {
  returnUrl: string
}

export function StripePaymentForm({ returnUrl }: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    })
    if (error) {
      setError(error.message ?? 'Betaling mislukt')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement />
      {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
      <Button type="submit" disabled={!stripe || loading}>
        {loading ? 'Bezig…' : 'Betalen →'}
      </Button>
    </form>
  )
}
