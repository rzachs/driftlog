import { initials } from '../utils'

const sizes = {
  sm: 'w-7 h-7 text-[0.6875rem]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-base',
}

export default function Avatar({ name, color, size = 'sm' }) {
  return (
    <div
      className={`${sizes[size]} rounded-full flex-none flex items-center justify-center font-semibold text-white`}
      style={{ background: color }}
      title={name}
    >
      {initials(name)}
    </div>
  )
}
