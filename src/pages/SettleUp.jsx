import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageShell from '../components/PageShell'
import Avatar from '../components/Avatar'
import BackLink from '../components/BackLink'
import { COLORS, fmt, initials } from '../utils'

function memberColor(members, id) {
  const i = members.findIndex(m => m.id === id)
  return COLORS[i >= 0 ? i % COLORS.length : 0]
}

export default function SettleUp() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const [payments, setPayments] = useState([])
  const [trip, setTrip] = useState(null)

  useEffect(() => {
    if (!tripId) { navigate('/trips'); return }
    Promise.all([
      fetch(`/api/trips/${tripId}/settle`).then(r => r.json()),
      fetch(`/api/trips/${tripId}`).then(r => r.json()),
    ]).then(([p, t]) => { setPayments(p); setTrip(t) })
  }, [tripId])

  async function recordPayment(p, i) {
    const res = await fetch(`/api/trips/${tripId}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromPersonId: p.from.id, toPersonId: p.to.id, amount: p.amount }),
    })
    const data = await res.json()
    setPayments(ps => ps.map((pmt, j) => j === i ? { ...pmt, recorded: true, id: data.id } : pmt))
  }

  async function undoPayment(p, i) {
    if (p.id) await fetch(`/api/trips/${tripId}/settle/${p.id}`, { method: 'DELETE' })
    setPayments(ps => ps.map((pmt, j) => j === i ? { ...pmt, recorded: false } : pmt))
  }

  if (!trip) return (
    <PageShell maxWidth="720px">
      <div className="p-10 text-center text-muted">Loading…</div>
    </PageShell>
  )

  const doneCount = payments.filter(p => p.recorded).length
  const allDone = payments.length > 0 && doneCount === payments.length

  return (
    <PageShell maxWidth="720px">
      <BackLink to={`/trips/${tripId}`}>{trip.name}</BackLink>

      <h1 className="mb-2 text-[1.75rem] leading-[1.28572] font-normal">Settle up</h1>
      <p className="mb-8 text-sm leading-[1.42857] text-muted max-w-[520px]">
        The fewest payments that zero out everyone's balance. Driftlog found{' '}
        <strong className="text-panel">{payments.length} payment{payments.length !== 1 ? 's' : ''}</strong>{' '}
        to clear all {trip.members.length} balances.
      </p>

      {allDone && (
        <div className="flex gap-3 items-start bg-success-bg p-4 mb-6 border-l-[3px] border-success">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor" className="mt-px flex-none text-success">
            <path d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2zm-2 19.59L8 15.587 9.412 14.17l4.588 4.588 10-10L25.41 10z"/>
          </svg>
          <div>
            <p className="mb-0.5 text-sm font-semibold text-panel">All settled up</p>
            <p className="m-0 text-sm text-gray-80">Every balance is back to zero. Have a good one.</p>
          </div>
        </div>
      )}

      <div className="flex items-baseline justify-between mb-4">
        <h2 className="m-0 text-sm font-semibold tracking-[0.16px]">Suggested payments</h2>
        <span className="text-xs tracking-[0.32px] text-muted">{doneCount} of {payments.length} recorded</span>
      </div>

      <div className="flex flex-col gap-px bg-subtle border border-subtle">
        {payments.length === 0 ? (
          <div className="p-6 text-muted text-sm bg-white">All balances are already zero — nothing to settle!</div>
        ) : payments.map((p, i) => (
          <div key={i} className="flex items-center gap-5 p-5 bg-white">
            <div className="flex items-center gap-[14px] flex-1 min-w-0" style={{ opacity: p.recorded ? 0.45 : 1 }}>
              <div className="flex items-center gap-[10px]">
                <Avatar name={p.from.name} color={memberColor(trip.members, p.from.id)} size="md" />
                <span className="text-sm font-semibold">{p.from.name}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" className="opacity-50">
                <path d="M18 6l-1.43 1.393L24.15 15H4v2h20.15l-7.58 7.573L18 26l10-10z"/>
              </svg>
              <div className="flex items-center gap-[10px]">
                <Avatar name={p.to.name} color={memberColor(trip.members, p.to.id)} size="md" />
                <span className="text-sm font-semibold">{p.to.name}</span>
              </div>
            </div>

            <span className="text-xl font-normal tabular-nums" style={{ opacity: p.recorded ? 0.45 : 1 }}>
              {fmt(p.amount)}
            </span>

            <div className="flex-none w-40 flex justify-end">
              {p.recorded ? (
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-[6px] text-sm text-success">
                    <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor">
                      <path d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2zm-2 19.59L8 15.587 9.412 14.17l4.588 4.588 10-10L25.41 10z"/>
                    </svg>
                    Settled
                  </span>
                  <button
                    onClick={() => undoPayment(p, i)}
                    className="border-0 bg-transparent cursor-pointer text-xs tracking-[0.32px] text-brand py-[6px] px-2 transition-colors duration-[110ms] hover:bg-[rgba(141,141,141,0.12)]"
                  >
                    Undo
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => recordPayment(p, i)}
                  className="h-10 border-0 bg-panel text-white text-sm tracking-[0.16px] px-4 cursor-pointer transition-colors duration-[110ms] hover:bg-gray-80"
                >
                  Record payment
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs leading-[1.33333] tracking-[0.32px] text-helper">
        Recording a payment marks it as transferred outside the app. Balances update once all suggested payments are recorded.
      </p>
    </PageShell>
  )
}
