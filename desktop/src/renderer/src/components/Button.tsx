import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

// Flat pill buttons from DESIGN.md: no shadow, a small press-down on click.
// In dark mode navy and cream swap, so the primary button turns cream on its own.
export function Button({ variant = 'primary', className = '', type = 'button', ...props }: Props) {
  const look =
    variant === 'primary'
      ? 'bg-navy text-cream border-2 border-navy'
      : 'bg-transparent text-navy border-2 border-navy'
  return (
    <button
      type={type}
      className={`press font-display text-xl leading-none rounded-pill px-[22px] py-[10px] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${look} ${className}`}
      {...props}
    />
  )
}
