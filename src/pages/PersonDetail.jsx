import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import { COLORS, fmt, initials } from '../utils'

export default function PersonDetail() {
  const { tripId, memberId } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState(null)
  const [trip, setTrip] = useState(null)

  useEffect(() => {
    if (!tripId || !memberId) { navigate('/trips'); return }
    Promise.all([
      fetch(`/api/trips/${tripId}/members/${memberId}/detail`).then(r => r.json()),
      fetch(`/api/trips/${tripId}`).then(r => r.json()),
    ]).then(([d, t]) => {
      if (d.error) { navigate(`/trips/${tripId}`); return }
      document.title = `Driftlog — ${d.member.name}`
      setDetail(d)
      setTrip(t)
    })
  }, [tripId, memberId])

  if (!detail || !trip) return (
    <div className="font-sans bg-white text-[#161616]">
      <Header />
      <main className="max-w-[768px] mx-auto px-4 pt-8 pb-20">
        <div className="p-10 text-center text-driftlog-text-2">Loading…</div>
      </main>
    </div>
  )

  const { member, rows, totalPaid, totalShare, netBalance } = detail
  const memberIdx = trip.members.findIndex(m => m.id === memberId)
  const avatarColor = COLORS[memberIdx >= 0 ? memberIdx % COLORS.length : 0]
  const accentColor = netBalance >= 0 ? '#24a148' : '#da1e28'
  const netLabel = netBalance >= 0 ? `${member.name} is owed` : `${member.name} owes the group`

  return (
    <div className="font-sans bg-white text-[#161616]">
      <Header />

      <main className="max-w-[768px] mx-auto px-4 pt-8 pb-20">
        <Link to={`/trips/${tripId}`} className="mb-8 inline-flex items-center gap-2 text-sm text-[#0f62fe] no-underline hover:underline">
          <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M14 26l1.41-1.41L7.83 17H28v-2H7.83l7.59-7.59L14 6 4 16z"/></svg>
          {trip.name}
        </Link>

        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-semibold" style={{ background: avatarColor }}>
            {initials(member.name)}
          </div>
          <div>
            <h1 className="m-0 text-[1.75rem] leading-[1.28572] font-normal">{member.name}</h1>
            <p className="mt-0.5 m-0 text-sm text-[#525252]">In {rows.length} expense{rows.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-px bg-[#c6c6c6] border border-[#c6c6c6] my-8 mb-12">
          <div className="bg-white p-5">
            <p className="mb-2 text-xs tracking-[0.32px] text-[#525252]">Paid</p>
            <p className="m-0 text-2xl font-normal tabular-nums">{fmt(totalPaid)}</p>
          </div>
          <div className="bg-white p-5">
            <p className="mb-2 text-xs tracking-[0.32px] text-[#525252]">Share of expenses</p>
            <p className="m-0 text-2xl font-normal tabular-nums">{fmt(totalShare)}</p>
          </div>
          <div className="bg-white p-5" style={{ borderTop: `3px solid ${accentColor}` }}>
            <p className="mb-2 text-xs tracking-[0.32px] text-[#525252]">Net balance</p>
            <p className="mb-[2px] m-0 text-2xl font-normal tabular-nums">{netBalance >= 0 ? '+' : '−'}{fmt(netBalance)}</p>
            <p className="m-0 text-xs tracking-[0.32px] text-[#525252]">{netLabel}</p>
          </div>
        </div>

        <div className="flex items-baseline justify-between mb-4">
          <h2 className="m-0 text-sm font-semibold tracking-[0.16px]">Breakdown by expense</h2>
          <span className="text-xs tracking-[0.32px] text-[#525252]">Net impact on {member.name}'s balance</span>
        </div>
        <div className="border border-[#c6c6c6]">
          {rows.map(r => {
            const netStr = (r.net > 0 ? '+' : '−') + fmt(r.net)
            const netColor = r.net > 0 ? '#24a148' : '#161616'
            const payerName = r.payer?.name || '?'
            const subLine = r.isPayer
              ? `${member.name} paid ${fmt(r.expense.amount)} · split ${r.ways} ways · share ${fmt(r.split.amount)}`
              : `${payerName} paid · split ${r.ways} ways · share ${fmt(r.split.amount)}`
            return (
              <div key={r.expense.id} className="grid grid-cols-[1fr_150px] items-center gap-4 px-4 py-[14px] border-b border-[#e0e0e0] transition-colors duration-[70ms] hover:bg-[#e8e8e8]">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="m-0 text-sm">{r.expense.description}</p>
                    {r.isPayer && (
                      <span className="text-[0.6875rem] tracking-[0.32px] text-[#0043ce] bg-[#d0e2ff] py-px px-2 rounded-full">{member.name} paid</span>
                    )}
                  </div>
                  <p className="mt-1 m-0 text-xs text-[#525252]">{subLine}</p>
                </div>
                <div className="text-right">
                  <p className="m-0 text-base tabular-nums" style={{ color: netColor }}>{netStr}</p>
                </div>
              </div>
            )
          })}
          <div className="grid grid-cols-[1fr_150px] items-center gap-4 p-4 bg-[#f4f4f4]">
            <p className="m-0 text-sm font-semibold">Net balance</p>
            <p className="m-0 text-right text-base font-semibold text-[#161616] tabular-nums">
              {netBalance >= 0 ? '+' : '−'}{fmt(netBalance)}
            </p>
          </div>
        </div>

        {netBalance < 0 && (
          <div className="flex items-center justify-between gap-6 mt-8 p-6 bg-[#f4f4f4]" style={{ borderLeft: '3px solid #0f62fe' }}>
            <div>
              <p className="mb-1 text-base font-semibold">{member.name} owes {fmt(Math.abs(netBalance))}</p>
              <p className="m-0 text-sm text-[#525252]">See the settle up screen to clear all balances.</p>
            </div>
            <Link
              to={`/trips/${tripId}/settle`}
              className="flex-none h-12 inline-flex items-center gap-12 px-4 bg-[#0f62fe] text-white text-sm tracking-[0.16px] no-underline transition-colors duration-[110ms] hover:bg-[#0050e6]"
            >
              <span>Settle up</span>
              <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M18 6l-1.43 1.393L24.15 15H4v2h20.15l-7.58 7.573L18 26l10-10z"/></svg>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
