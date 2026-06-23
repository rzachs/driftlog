import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'

export default function Login() {
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)

  return (
    <div className="min-h-screen flex font-sans bg-white text-panel">
      <section className="flex-1 min-w-0 bg-panel text-white p-16 flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-brand-accent flex items-center justify-center">
            <span className="text-white font-semibold text-[0.9375rem] leading-none">$</span>
          </div>
          <span className="text-sm font-semibold tracking-[0.16px]">Driftlog</span>
        </div>

        <div className="max-w-[440px]">
          <p className="mb-4 text-xs tracking-[0.32px] text-gray-40 uppercase">Trip expense splitter</p>
          <h1 className="mb-6 text-[3.375rem] leading-[1.199] font-light">Split the trip, not the friendship.</h1>
          <p className="text-base leading-[1.5] text-gray-30 max-w-[380px]">Log who paid for what as it happens. See live balances. Settle up at the end with the fewest possible payments.</p>
        </div>

        <p className="text-xs tracking-[0.32px] text-gray-50">© 2026 Driftlog</p>
      </section>

      <section className="flex-1 min-w-0 flex items-center justify-center p-12">
        <div className="w-full max-w-[384px]">
          <h2 className="mb-2 text-[1.75rem] leading-[1.28572] font-normal">Log in</h2>
          <p className="mb-10 text-sm leading-[1.42857] text-muted">
            New to Driftlog?{' '}
            <a href="#" className="text-brand no-underline hover:underline hover:text-brand-active">Create an account</a>
          </p>

          <form onSubmit={e => { e.preventDefault(); navigate('/trips') }}>
            <label className="block text-xs tracking-[0.32px] text-muted mb-2">Email</label>
            <div className="mb-6">
              <input className="w-full h-12 border-0 border-b border-strong bg-field text-panel text-sm px-4" type="email" placeholder="you@example.com" />
            </div>

            <label className="block text-xs tracking-[0.32px] text-muted mb-2">Password</label>
            <div className="relative mb-2">
              <input
                className="w-full h-12 border-0 border-b border-strong bg-field text-panel text-sm pl-4 pr-12"
                type={showPw ? 'text' : 'password'}
                placeholder="Enter password"
              />
              <button
                type="button"
                aria-label="Show password"
                onClick={() => setShowPw(v => !v)}
                className="absolute top-0 right-0 w-12 h-12 border-0 bg-transparent cursor-pointer flex items-center justify-center text-muted hover:bg-field-hover"
              >
                <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                  <path d="M30.94 15.66A16.69 16.69 0 0 0 16 5 16.69 16.69 0 0 0 1.06 15.66a1 1 0 0 0 0 .68A16.69 16.69 0 0 0 16 27a16.69 16.69 0 0 0 14.94-10.66 1 1 0 0 0 0-.68zM16 25c-5.37 0-10.26-3.57-12.87-9C5.74 10.57 10.63 7 16 7s10.26 3.57 12.87 9C26.26 21.43 21.37 25 16 25z"/>
                  <path d="M16 10a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4z"/>
                </svg>
              </button>
            </div>

            <div className="mb-10">
              <a href="#" className="text-xs tracking-[0.32px] text-brand no-underline hover:underline hover:text-brand-active">Forgot password?</a>
            </div>

            <Button type="submit" className="w-full">
              <span>Log in</span>
              <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                <path d="M18 6l-1.43 1.393L24.15 15H4v2h20.15l-7.58 7.573L18 26l10-10z"/>
              </svg>
            </Button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <span className="flex-1 h-px bg-subtle"></span>
            <span className="text-xs tracking-[0.32px] text-helper whitespace-nowrap">or continue with</span>
            <span className="flex-1 h-px bg-subtle"></span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Google', icon: <GoogleIcon /> },
              { label: 'Microsoft', icon: <MicrosoftIcon /> },
              { label: 'Apple', icon: <AppleIcon /> },
              { label: 'Facebook', icon: <FacebookIcon /> },
            ].map(({ label, icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => navigate('/trips')}
                className="h-12 border border-subtle bg-white cursor-pointer flex items-center justify-center gap-2 text-panel text-sm tracking-[0.16px] transition-colors duration-[110ms] hover:bg-field-hover hover:border-strong"
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>

          <p className="mt-12 text-xs leading-[1.33333] tracking-[0.32px] text-helper">By logging in you agree to Driftlog's terms of use and privacy policy.</p>
        </div>
      </section>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.94H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.06l3.01-2.34Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="0" y="0" width="8.5" height="8.5" fill="#F25022"/>
      <rect x="9.5" y="0" width="8.5" height="8.5" fill="#7FBA00"/>
      <rect x="0" y="9.5" width="8.5" height="8.5" fill="#00A4EF"/>
      <rect x="9.5" y="9.5" width="8.5" height="8.5" fill="#FFB900"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="#161616" aria-hidden="true">
      <path d="M13.3 9.55c-.02-2.04 1.67-3.02 1.75-3.07-.95-1.4-2.44-1.59-2.97-1.61-1.26-.13-2.46.74-3.1.74-.64 0-1.63-.72-2.68-.7-1.38.02-2.65.8-3.36 2.04-1.43 2.49-.37 6.17 1.03 8.19.68.99 1.5 2.1 2.56 2.06 1.03-.04 1.42-.66 2.66-.66 1.24 0 1.59.66 2.68.64 1.1-.02 1.81-1.01 2.49-2 .78-1.15 1.1-2.26 1.12-2.32-.02-.01-2.15-.83-2.18-3.28-.02-2.05 1.67-3.03 1.75-3.08ZM11.3 3.47c.56-.68.94-1.63.84-2.57-.81.03-1.79.54-2.37 1.22-.52.6-.98 1.56-.86 2.48.9.07 1.83-.46 2.39-1.13Z"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M18 9a9 9 0 1 0-10.41 8.89v-6.29H5.31V9h2.28V7.02c0-2.25 1.34-3.5 3.4-3.5.98 0 2.01.18 2.01.18v2.22h-1.13c-1.12 0-1.47.69-1.47 1.4V9h2.5l-.4 2.6h-2.1v6.29A9 9 0 0 0 18 9Z" fill="#1877F2"/>
    </svg>
  )
}
