import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  pequeno?: boolean
}

const estilos: Record<Variante, string> = {
  primary: 'bg-orange-600 text-white hover:bg-orange-700',
  secondary: 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-stone-600 hover:bg-stone-100',
}

export function Button({ variante = 'primary', pequeno = false, className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        pequeno ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm'
      } ${estilos[variante]} ${className}`}
    />
  )
}
