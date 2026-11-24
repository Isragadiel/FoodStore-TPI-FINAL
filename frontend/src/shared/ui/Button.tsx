import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: Props) {
  const styles = {
    primary: 'btn',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
  }

  return (
    <button
      type={type}
      className={`${styles[variant]} ${className}`}
      {...props}
    />
  )
}
