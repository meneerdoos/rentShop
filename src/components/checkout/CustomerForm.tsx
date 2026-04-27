'use client'
import { Input } from '@/components/ui/Input'

interface CustomerFormProps {
  values: { name: string; email: string; phone: string }
  onChange: (field: string, value: string) => void
}

export function CustomerForm({ values, onChange }: CustomerFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Naam"
        id="name"
        value={values.name}
        onChange={e => onChange('name', e.target.value)}
        required
      />
      <Input
        label="E-mailadres"
        id="email"
        type="email"
        value={values.email}
        onChange={e => onChange('email', e.target.value)}
        required
      />
      <Input
        label="Telefoonnummer"
        id="phone"
        type="tel"
        value={values.phone}
        onChange={e => onChange('phone', e.target.value)}
        required
      />
    </div>
  )
}
