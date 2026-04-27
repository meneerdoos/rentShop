'use client'

interface QuantitySelectorProps {
  value: number
  max: number
  onChange: (value: number) => void
}

export function QuantitySelector({ value, max, onChange }: QuantitySelectorProps) {
  return (
    <div className="inline-flex items-center border-2 border-black">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="px-4 py-2 font-black text-lg hover:bg-black hover:text-white transition-colors"
      >
        −
      </button>
      <span className="font-black text-xl w-10 text-center">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="px-4 py-2 font-black text-lg hover:bg-black hover:text-white transition-colors disabled:opacity-30"
      >
        +
      </button>
    </div>
  )
}
