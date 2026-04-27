interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline'
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const base = 'font-black uppercase tracking-wide px-6 py-3 transition-colors disabled:opacity-50 cursor-pointer'
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-hover',
    outline: 'border-2 border-black text-black hover:bg-black hover:text-white',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
