import { Link } from 'react-router-dom'

const base = 'inline-flex items-center justify-between gap-12 h-12 px-4 text-sm tracking-[0.16px] cursor-pointer border-0 transition-colors duration-[110ms]'

const variants = {
  primary: 'bg-brand text-white hover:bg-brand-hover active:bg-brand-active',
  secondary: 'bg-panel text-white hover:bg-gray-80',
  danger: 'bg-danger text-white hover:bg-[#ba1b23]',
}

export function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function ButtonLink({ variant = 'primary', className = '', to, children, ...props }) {
  return (
    <Link to={to} className={`${base} ${variants[variant]} no-underline ${className}`} {...props}>
      {children}
    </Link>
  )
}
