import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import { col, fmt, fmtDate, initials } from '../utils'

export default function TripOverview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)

  useEffect(() => {
    if (!id) { navigate('/trips'); return }
    fetch(`/api/trips/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { navigate('/trips'); return }
        document.title = `Driftlog — ${data.name}`
        setTrip(data)
      })
  }, [id])

  if (!trip) return (
    <div className="font-sans bg-white text-[#161616]">
      <Header />
      <main className="max-w-[1056px] mx-auto px-4 pt-12 pb-20">
        <div className="p-10 text-center text-driftlog-text-2">Loading…</div>
      </main>
    </div>
  )

  const { members, balances, expenses } = trip
  const totalAmt = expenses.reduce((s, e) => s + e.amount, 0)
  const dateStr = [trip.start_date, trip.end_date].filter(Boolean).map(fmtDate).join(' – ') || '—'

  return (
    <div className="font-sans bg-white text-[#161616]">
      <Header />

      <main className="max-w-[1056px] mx-auto px-4 pt-12 pb-20">
        <div className="flex items-start gap-6 mb-12">
          <div className="min-w-0">
            <p className="mb-2 text-xs tracking-[0.32px] text-[#525252] uppercase">Trip</p>
            <h1 className="mb-3 text-[2rem] leading-[1.25] font-normal">{trip.name}</h1>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="inline-flex items-center gap-2 text-sm text-[#525252]">
                <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" className="opacity-60">
                  <path d="M26 4h-4V2h-2v2h-8V2h-2v2H6C4.9 4 4 4.9 4 6v20c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 22H6V12h20v14zm0-16H6V6h4v2h2V6h8v2h2V6h4v4z"/>
                </svg>
                {dateStr}
              </span>
              <span className="w-px h-4 bg-[#c6c6c6]"></span>
              <div className="flex items-center">
                {members.slice(0, 4).map((m, i) => (
                  <div
                    key={m.id}
                    title={m.name}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[0.6875rem] font-semibold text-white border-2 border-white"
                    style={{ background: col(i), marginLeft: i > 0 ? '-6px' : undefined }}
                  >
                    {initials(m.name)}
                  </div>
                ))}
                <span className="ml-3 text-sm text-[#525252]">{members.length} people</span>
              </div>
            </div>
          </div>
          <Link
            to={`/trips/${id}/add-expense`}
            className="ml-auto flex-none h-12 bg-[#0f62fe] text-white text-sm tracking-[0.16px] no-underline inline-flex items-center gap-12 px-4 transition-colors duration-[110ms] hover:bg-[#0050e6]"
          >
            <span>Add expense</span>
            <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M17 15V8h-2v7H8v2h7v7h2v-7h7v-2z"/></svg>
          </Link>
        </div>

        <h2 className="mb-4 text-sm font-semibold tracking-[0.16px]">Balances</h2>
        <div
          className="grid gap-px bg-[#c6c6c6] border border-[#c6c6c6] mb-12"
          style={{ gridTemplateColumns: `repeat(${members.length}, 1fr)` }}
        >
          {balances.map((b, i) => {
            const owed = b.balance > 0
            const accentColor = owed ? '#24a148' : '#da1e28'
            const statusLabel = b.name === 'You' ? 'You are owed' : (owed ? 'Is owed' : 'Owes the group')
            return (
              <Link
                key={b.id}
                to={`/trips/${id}/members/${b.id}`}
                className="block bg-white p-5 no-underline text-[#161616] transition-colors duration-[70ms] hover:bg-[#e8e8e8]"
                style={{ borderTop: `3px solid ${accentColor}` }}
              >
                <div className="flex items-center gap-[10px] mb-5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[0.6875rem] font-semibold text-white" style={{ background: col(i) }}>
                    {initials(b.name)}
                  </div>
                  <span className="text-sm font-semibold">{b.name}</span>
                </div>
                <p className="mb-[2px] text-[1.75rem] leading-[1.28572] font-normal" style={{ color: owed ? '#24a148' : '#161616' }}>
                  {fmt(Math.abs(b.balance))}
                </p>
                <p className="text-xs tracking-[0.32px] text-[#525252]">{statusLabel}</p>
              </Link>
            )
          })}
        </div>

        <div className="flex items-baseline justify-between mb-4">
          <h2 className="m-0 text-sm font-semibold tracking-[0.16px]">Recent expenses</h2>
          <span className="text-xs tracking-[0.32px] text-[#525252]">
            {expenses.length} expense{expenses.length !== 1 ? 's' : ''} · {fmt(totalAmt)} total
          </span>
        </div>
        <div className="border border-[#c6c6c6]">
          <div className="grid grid-cols-[1fr_140px_140px_120px_40px] items-center px-4 h-10 bg-[#f4f4f4] border-b border-[#c6c6c6]">
            <span className="text-xs font-semibold tracking-[0.32px] text-[#525252]">Description</span>
            <span className="text-xs font-semibold tracking-[0.32px] text-[#525252]">Date</span>
            <span className="text-xs font-semibold tracking-[0.32px] text-[#525252]">Split</span>
            <span className="text-xs font-semibold tracking-[0.32px] text-[#525252] text-right">Amount</span>
            <span></span>
          </div>
          {expenses.length === 0 ? (
            <div className="px-4 py-6 text-[#525252] text-sm">No expenses yet.</div>
          ) : expenses.map(exp => {
            const payerIdx = members.findIndex(m => m.id === exp.paid_by_id)
            const payerColor = col(payerIdx >= 0 ? payerIdx : 0)
            const payerName = exp.payer?.name || '?'
            const waysCount = exp.splits?.length || 0
            return (
              <div
                key={exp.id}
                className="grid grid-cols-[1fr_140px_140px_120px_40px] items-center px-4 min-h-14 border-b border-[#e0e0e0] transition-colors duration-[70ms] hover:bg-[#e8e8e8] cursor-pointer"
                onClick={() => navigate(`/trips/${id}/members/${members[0]?.id}`)}
              >
                <div className="flex items-center gap-3 min-w-0 py-2">
                  <div className="w-8 h-8 rounded-full flex-none flex items-center justify-center text-[0.6875rem] font-semibold text-white" style={{ background: payerColor }}>
                    {initials(payerName)}
                  </div>
                  <div className="min-w-0">
                    <p className="m-0 text-sm truncate">{exp.description}</p>
                    <p className="m-0 mt-0.5 text-xs text-[#525252]">{payerName === 'You' ? 'You paid' : `${payerName} paid`}</p>
                  </div>
                </div>
                <span className="text-sm text-[#525252]">{exp.date}</span>
                <span className="text-sm text-[#525252]">Split {waysCount} ways</span>
                <span className="text-sm text-right tabular-nums">{fmt(exp.amount)}</span>
                <span className="flex justify-end">
                  <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" className="opacity-50">
                    <path d="M22 16L12 26l-1.414-1.414L19.172 16l-8.586-8.586L12 6z"/>
                  </svg>
                </span>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between gap-6 mt-8 p-6 bg-[#f4f4f4]" style={{ borderLeft: '3px solid #0f62fe' }}>
          <div>
            <p className="mb-1 text-base font-semibold">Ready to settle up?</p>
            <p className="m-0 text-sm text-[#525252]">Clear all balances with the fewest possible payments.</p>
          </div>
          <Link
            to={`/trips/${id}/settle`}
            className="flex-none h-12 inline-flex items-center gap-12 px-4 border border-[#0f62fe] text-[#0f62fe] text-sm tracking-[0.16px] no-underline transition-colors duration-[110ms] hover:bg-[rgba(141,141,141,0.12)]"
          >
            <span>Settle up</span>
            <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M18 6l-1.43 1.393L24.15 15H4v2h20.15l-7.58 7.573L18 26l10-10z"/></svg>
          </Link>
        </div>
      </main>
    </div>
  )
}
