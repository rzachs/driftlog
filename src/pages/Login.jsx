import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

// spec row 9: error messages per error code
const ERROR_MESSAGES = {
  csrf:         'Login failed — please try again',
  oauth_failed: 'Google sign-in was cancelled or failed',
  server_error: 'Something went wrong — please try again',
}

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const error = searchParams.get('error')

  // spec AC: already logged in → redirect to /trips
  useEffect(() => {
    fetch('/api/me').then(r => { if (r.ok) navigate('/trips', { replace: true }) })
  }, [navigate])

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

          {/* spec row 9: inline error message */}
          {error && ERROR_MESSAGES[error] && (
            <div className="mb-6 px-4 py-3 bg-danger-bg text-danger text-sm">
              {ERROR_MESSAGES[error]}
            </div>
          )}

          <p className="mb-10 text-sm leading-[1.42857] text-muted max-w-[320px]">
            Sign in with your Google account to start splitting trips.
          </p>

          {/* spec AC: Google button initiates real OAuth */}
          <button
            type="button"
            onClick={() => { window.location.href = '/auth/google' }}
            aria-label="Sign in with Google"
            className="w-full h-12 border border-subtle bg-white cursor-pointer flex items-center justify-center gap-3 text-panel text-sm tracking-[0.16px] transition-colors duration-[110ms] hover:bg-field-hover hover:border-strong"
          >
            <GoogleIcon />
            <span className="font-semibold">Sign in with Google</span>
          </button>

          <p className="mt-8 text-xs leading-[1.33333] tracking-[0.32px] text-helper max-w-[320px]">By continuing you agree to Driftlog's terms of use and privacy policy.</p>
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
