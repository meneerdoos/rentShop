type BadgeVariant = 'confirmed' | 'pending_payment' | 'cancelled'

const styles: Record<BadgeVariant, string> = {
  confirmed: 'bg-green-100 text-green-800',
  pending_payment: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-red-100 text-red-700',
}

const labels: Record<BadgeVariant, string> = {
  confirmed: 'Bevestigd',
  pending_payment: 'In behandeling',
  cancelled: 'Geannuleerd',
}

export function Badge({ variant }: { variant: BadgeVariant }) {
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full ${styles[variant]}`}>
      {labels[variant]}
    </span>
  )
}
