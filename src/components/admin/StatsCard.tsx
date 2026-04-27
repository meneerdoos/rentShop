interface StatsCardProps {
  label: string
  value: string | number
  accent?: boolean
}

export function StatsCard({ label, value, accent }: StatsCardProps) {
  return (
    <div className="bg-white rounded border border-gray-200 p-6">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-3xl font-black ${accent ? 'text-brand' : 'text-black'}`}>{value}</p>
    </div>
  )
}
