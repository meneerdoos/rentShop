import { Resend } from 'resend'

let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY!)
  }
  return _resend
}

export async function sendBookingConfirmation({
  to,
  customerName,
  orderId,
  startDate,
  endDate,
  totalPrice,
  locale,
}: {
  to: string
  customerName: string
  orderId: string
  startDate: string
  endDate: string
  totalPrice: number
  locale: string
}) {
  const ref = orderId.slice(0, 8).toUpperCase()
  const isNl = locale === 'nl'
  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: isNl ? `Bevestiging boeking #${ref}` : `Booking confirmation #${ref}`,
    html: isNl
      ? `<p>Beste ${customerName},</p><p>Uw boeking is bevestigd. Referentie: <strong>${ref}</strong></p><p>Huurperiode: ${startDate} t/m ${endDate}</p><p>Totaal: <strong>€${totalPrice.toFixed(2)}</strong></p>`
      : `<p>Dear ${customerName},</p><p>Your booking is confirmed. Reference: <strong>${ref}</strong></p><p>Rental period: ${startDate} to ${endDate}</p><p>Total: <strong>€${totalPrice.toFixed(2)}</strong></p>`,
  })
}
