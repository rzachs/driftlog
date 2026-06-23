import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageShell from '../components/PageShell'
import Avatar from '../components/Avatar'
import BackLink from '../components/BackLink'
import { ButtonLink } from '../components/Button'
import CalloutBanner from '../components/CalloutBanner'
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
    <PageShell maxWidth="768px">
      <div className="p-10 text-center text-muted">Loading…</div>
    </PageShell>
  )

  const { member, rows, totalPaid, totalShare, netBalance } = detail
  const memberIdx = trip.members.findIndex(m => m.id === memberId)
  const avatarColor = COLORS[memberIdx >= 0 ? memberIdx % COLORS.length : 0]
  const accentColor = netBalance >= 0 ? '#24a148' : '#da1e28'
  const netLabel = netBalance >= 0 ? `${member.name} is owed` : `${member.name} owes the group`

  return (
    <PageShell maxWidth="768px">
      <BackLink to={`/trips/${tripId}`}>{trip.name}</BackLink>

      <div className="flex items-center gap-4 mb-2">
        <Avatar name={member.name} color={avatarColor} size="lg" />
        <div>
          <h1 className="m-0 text-[1.75rem] leading-[1.28572] font-normal">{member.name}</h1>
          <p className="mt-0.5 m-0 text-sm text-muted">In {rows.length} expense{rows.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px bg-subtle border border-subtle my-8 mb-12">
        <div className="bg-white p-5">
          <p className="mb-2 text-xs tracking-[0.32px] text-muted">Paid</p>
          <p className="m-0 text-2xl font-normal tabular-nums">{fmt(totalPaid)}</p>
        </div>
        <div className="bg-white p-5">
          <p className="mb-2 text-xs tracking-[0.32px] text-muted">Share of expenses</p>
          <p className="m-0 text-2xl font-normal tabular-nums">{fmt(totalShare)}</p>
        </div>
        <div className="bg-white p-5" style={{ borderTop: `3px solid ${accentColor}` }}>
          <p className="mb-2 text-xs tracking-[0.32px] text-muted">Net balance</p>
          <p className="mb-[2px] m-0 text-2xl font-normal tabular-nums">{netBalance >= 0 ? '+' : '−'}{fmt(netBalance)}</p>
          <p className="m-0 text-xs tracking-[0.32px] text-muted">{netLabel}</p>
        </div>
      </div>

      <div className="flex items-baseline justify-between mb-4">
        <h2 className="m-0 text-sm font-semibold tracking-[0.16px]">Breakdown by expense</h2>
        <span className="text-xs tracking-[0.32px] text-muted">Net impact on {member.name}'s balance</span>
      </div>
      <div className="border border-subtle">
        {rows.map(r => {
          const netStr = (r.net > 0 ? '+' : '−') + fmt(r.net)
          const netColor = r.net > 0 ? 'text-success' : 'text-panel'
          const payerName = r.payer?.name || '?'
          const subLine = r.isPayer
            ? `${member.name} paid ${fmt(r.expense.amount)} · split ${r.ways} ways · share ${fmt(r.split.amount)}`
            : `${payerName} paid · split ${r.ways} ways · share ${fmt(r.split.amount)}`
          return (
            <div key={r.expense.id} className="grid grid-cols-[1fr_150px] items-center gap-4 px-4 py-[14px] border-b border-row transition-colors duration-[70ms] hover:bg-field-hover">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="m-0 text-sm">{r.expense.description}</p>
                  {r.isPayer && (
                    <span className="text-[0.6875rem] tracking-[0.32px] text-badge bg-badge-bg py-px px-2 rounded-full">{member.name} paid</span>
                  )}
                </div>
                <p className="mt-1 m-0 text-xs text-muted">{subLine}</p>
              </div>
              <div className="text-right">
                <p className={`m-0 text-base tabular-nums ${netColor}`}>{netStr}</p>
              </div>
            </div>
          )
        })}
        <div className="grid grid-cols-[1fr_150px] items-center gap-4 p-4 bg-field">
          <p className="m-0 text-sm font-semibold">Net balance</p>
          <p className="m-0 text-right text-base font-semibold text-panel tabular-nums">
            {netBalance >= 0 ? '+' : '−'}{fmt(netBalance)}
          </p>
        </div>
      </div>

      {netBalance < 0 && (
        <CalloutBanner
          title={`${member.name} owes ${fmt(Math.abs(netBalance))}`}
          sub="See the settle up screen to clear all balances."
          action={
            <ButtonLink to={`/trips/${tripId}/settle`} className="flex-none">
              <span>Settle up</span>
              <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M18 6l-1.43 1.393L24.15 15H4v2h20.15l-7.58 7.573L18 26l10-10z"/></svg>
            </ButtonLink>
          }
        />
      )}
    </PageShell>
  )
}
