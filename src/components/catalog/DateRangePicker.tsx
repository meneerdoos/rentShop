'use client'
import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import type { DateRange } from 'react-day-picker'
import 'react-day-picker/style.css'
import { format } from 'date-fns'

interface DateRangePickerProps {
  onRangeChange: (startDate: string, endDate: string) => void
}

export function DateRangePicker({ onRangeChange }: DateRangePickerProps) {
  const [range, setRange] = useState<DateRange | undefined>()

  function handleSelect(r: DateRange | undefined) {
    setRange(r)
    if (r?.from && r?.to) {
      onRangeChange(format(r.from, 'yyyy-MM-dd'), format(r.to, 'yyyy-MM-dd'))
    }
  }

  return (
    <div className="border-2 border-black p-2 inline-block">
      <DayPicker
        mode="range"
        selected={range}
        onSelect={handleSelect}
        disabled={{ before: new Date() }}
        numberOfMonths={2}
      />
    </div>
  )
}
