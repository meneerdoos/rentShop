interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Input({ label, id, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-black uppercase tracking-widest">
        {label}
      </label>
      <input
        id={id}
        className={`border-2 border-black px-4 py-2 focus:outline-none focus:border-brand ${className}`}
        {...props}
      />
    </div>
  )
}
