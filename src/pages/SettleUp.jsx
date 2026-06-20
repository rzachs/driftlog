import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
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
    <div className="font-sans bg-white text-[#161616]">
      <Header />
      <main className="max-w-[720px] mx-auto px-4 pt-8 pb-20">
        <div className="p-10 text-center text-driftlog-text-2">Loading…</div>
      </main>
    </div>
  )

  const doneCount = payments.filter(p => p.recorded).length
  const allDone = payments.length > 0 && doneCount === payments.length

  return (
    <div className="font-sans bg-white text-[#161616]">
      <Header />

      <main className="max-w-[720px] mx-auto px-4 pt-8 pb-20">
        <Link to={`/trips/${tripId}`} className="mb-8 inline-flex items-center gap-2 text-sm text-driftlog-blue no-underline hover:underline">
          <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M14 26l1.41-1.41L7.83 17H28v-2H7.83l7.59-7.59L14 6 4 16z"/></svg>
          {trip.name}
        </Link>

        <h1 className="mb-2 text-[1.75rem] leading-[1.28572] font-normal">Settle up</h1>
        <p className="mb-8 text-sm leading-[1.42857] text-[#525252] max-w-[520px]">
          The fewest payments that zero out everyone's balance. Driftlog found{' '}
          <strong className="text-[#161616]">{payments.length} payment{payments.length !== 1 ? 's' : ''}</strong>{' '}
          to clear all {trip.members.length} balances.
        </p>

        {allDone && (
          <div className="flex gap-3 items-start bg-[#defbe6] p-4 mb-6" style={{ borderLeft: '3px solid #24a148' }}>
            <svg width="20" height="20" viewBox="0 0 32 32" fill="#24a148" className="mt-px flex-none">
              <path d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2zm-2 19.59L8 15.587 9.412 14.17l4.588 4.588 10-10L25.41 10z"/>
            </svg>
            <div>
              <p className="mb-0.5 text-sm font-semibold text-[#161616]">All settled up</p>
              <p className="m-0 text-sm text-[#393939]">Every balance is back to zero. Have a good one.</p>
            </div>
          </div>
        )}

        <div className="flex items-baseline justify-between mb-4">
          <h2 className="m-0 text-sm font-semibold tracking-[0.16px]">Suggested payments</h2>
          <span className="text-xs tracking-[0.32px] text-[#525252]">{doneCount} of {payments.length} recorded</span>
        </div>

        <div className="flex flex-col gap-px bg-driftlog-border-subtle border border-driftlog-border-subtle">
          {payments.length === 0 ? (
            <div className="p-6 text-[#525252] text-sm bg-white">All balances are already zero — nothing to settle!</div>
          ) : payments.map((p, i) => (
            <div key={i} className="flex items-center gap-5 p-5 bg-white">
              <div className="flex items-center gap-[14px] flex-1 min-w-0" style={{ opacity: p.recorded ? 0.45 : 1 }}>
                <div className="flex items-center gap-[10px]">
                  <div
                    className="rounded-full flex items-center justify-center text-white text-xs font-semibold flex-none"
                    style={{ width: 36, height: 36, background: memberColor(trip.members, p.from.id) }}
                  >
                    {initials(p.from.name)}
                  </div>
                  <span className="text-sm font-semibold">{p.from.name}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" className="opacity-50">
                  <path d="M18 6l-1.43 1.393L24.15 15H4v2h20.15l-7.58 7.573L18 26l10-10z"/>
                </svg>
                <div className="flex items-center gap-[10px]">
                  <div
                    className="rounded-full flex items-center justify-center text-white text-xs font-semibold flex-none"
                    style={{ width: 36, height: 36, background: memberColor(trip.members, p.to.id) }}
                  >
                    {initials(p.to.name)}
                  </div>
                  <span className="text-sm font-semibold">{p.to.name}</span>
                </div>
              </div>

              <span className="text-xl font-normal tabular-nums" style={{ opacity: p.recorded ? 0.45 : 1 }}>
                {fmt(p.amount)}
              </span>

              <div className="flex-none w-40 flex justify-end">
                {p.recorded ? (
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-[6px] text-sm text-[#24a148]">
                      <svg width="16" height="16" viewBox="0 0 32 32" fill="#24a148">
                        <path d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2zm-2 19.59L8 15.587 9.412 14.17l4.588 4.588 10-10L25.41 10z"/>
                      </svg>
                      Settled
                    </span>
                    <button
                      onClick={() => undoPayment(p, i)}
                      className="border-0 bg-transparent cursor-pointer text-xs tracking-[0.32px] text-[#0f62fe] py-[6px] px-2 transition-colors duration-[110ms] hover:bg-[rgba(141,141,141,0.12)]"
                    >
                      Undo
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => recordPayment(p, i)}
                    className="h-10 border-0 bg-[#161616] text-white text-sm tracking-[0.16px] px-4 cursor-pointer transition-colors duration-[110ms] hover:bg-[#393939]"
                  >
                    Record payment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs leading-[1.33333] tracking-[0.32px] text-[#6f6f6f]">
          Recording a payment marks it as transferred outside the app. Balances update once all suggested payments are recorded.
        </p>
      </main>
    </div>
  )
}
