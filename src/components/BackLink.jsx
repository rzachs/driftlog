import { Link } from 'react-router-dom'

export default function BackLink({ to, children }) {
  return (
    <Link to={to} className="mb-8 inline-flex items-center gap-2 text-sm text-brand no-underline hover:underline">
      <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
        <path d="M14 26l1.41-1.41L7.83 17H28v-2H7.83l7.59-7.59L14 6 4 16z"/>
      </svg>
      {children}
    </Link>
  )
}
