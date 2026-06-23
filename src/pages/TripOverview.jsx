import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import PageShell from '../components/PageShell'
import Avatar from '../components/Avatar'
import { Button, ButtonLink } from '../components/Button'
import CalloutBanner from '../components/CalloutBanner'
import { col, fmt, fmtDate, initials } from '../utils'

export default function TripOverview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const titleRef = useRef(null)
  const menuRef = useRef(null)

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

  useEffect(() => {
    if (trip && titleRef.current) {
      titleRef.current.textContent = trip.name
    }
  }, [trip?.name])

  useEffect(() => {
    if (!menuOpen) return
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  async function confirmDelete() {
    await fetch(`/api/trips/${id}`, { method: 'DELETE' })
    navigate('/trips')
  }

  if (!trip) return (
    <PageShell maxWidth="1056px">
      <div className="p-10 text-center text-muted">Loading…</div>
    </PageShell>
  )

  const { members, balances, expenses } = trip
  const totalAmt = expenses.reduce((s, e) => s + e.amount, 0)
  const dateStr = [trip.start_date, trip.end_date].filter(Boolean).map(fmtDate).join(' – ') || '—'

  return (
    <PageShell maxWidth="1056px">
      <div className="pt-4">
        <div className="flex items-start gap-6 mb-12">
          <div className="min-w-0">
            <p className="mb-2 text-xs tracking-[0.32px] text-muted uppercase">Trip</p>
            <h1
              ref={titleRef}
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              aria-label="Trip name"
              className="mb-3 -mx-2 px-2 text-[2rem] leading-[1.25] font-normal rounded-none outline-none cursor-text border-b-2 border-transparent hover:border-subtle focus:border-brand transition-colors duration-[110ms]"
              onBlur={e => {
                const next = (e.currentTarget.textContent || '').replace(/\s+/g, ' ').trim() || trip.name
                e.currentTarget.textContent = next
                if (next === trip.name) return
                fetch(`/api/trips/${id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: next }),
                }).then(() => {
                  document.title = `Driftlog — ${next}`
                  setTrip(t => ({ ...t, name: next }))
                })
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur() }
                if (e.key === 'Escape') {
                  e.preventDefault()
                  e.currentTarget.textContent = trip.name
                  e.currentTarget.blur()
                }
              }}
            />
            <div className="flex items-center gap-4 flex-wrap">
              <span className="inline-flex items-center gap-2 text-sm text-muted">
                <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" className="opacity-60">
                  <path d="M26 4h-4V2h-2v2h-8V2h-2v2H6C4.9 4 4 4.9 4 6v20c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 22H6V12h20v14zm0-16H6V6h4v2h2V6h8v2h2V6h4v4z"/>
                </svg>
                {dateStr}
              </span>
              <span className="w-px h-4 bg-subtle"></span>
              <div className="flex items-center">
                {members.slice(0, 4).map((m, i) => (
                  <div key={m.id} className={`border-2 border-white rounded-full${i > 0 ? ' -ml-[6px]' : ''}`}>
                    <Avatar name={m.name} color={col(i)} size="sm" />
                  </div>
                ))}
                <span className="ml-3 text-sm text-muted">{members.length} people</span>
              </div>
            </div>
          </div>
          <div className="ml-auto flex-none flex items-stretch gap-px">
            <ButtonLink to={`/trips/${id}/add-expense`}>
              <span>Add expense</span>
              <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M17 15V8h-2v7H8v2h7v7h2v-7h7v-2z"/></svg>
            </ButtonLink>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(o => !o)}
                aria-label="More actions"
                className="h-12 w-12 border border-subtle bg-white text-panel cursor-pointer flex items-center justify-center transition-colors duration-[70ms] hover:bg-field-hover"
              >
                <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor">
                  <circle cx="16" cy="8" r="2"/><circle cx="16" cy="16" r="2"/><circle cx="16" cy="24" r="2"/>
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-px w-[200px] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.3)] z-20">
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); setDeleteOpen(true) }}
                    className="w-full h-10 border-0 bg-white text-danger text-sm text-left px-4 cursor-pointer flex items-center gap-3 transition-colors duration-[70ms] hover:bg-field-hover"
                  >
                    <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor">
                      <path d="M12 12h2v12h-2zm6 0h2v12h-2z"/>
                      <path d="M4 6v2h2l2 20h16l2-20h2V6H4zm6.5 22L8.4 8h15.2l-2.1 20h-7zM12 2h8v2h-8z"/>
                    </svg>
                    Delete trip
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <h2 className="mb-4 text-sm font-semibold tracking-[0.16px]">Balances</h2>
        <div
          className="grid gap-px bg-subtle border border-subtle mb-12"
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
                className="block bg-white p-5 no-underline text-panel transition-colors duration-[70ms] hover:bg-field-hover"
                style={{ borderTop: `3px solid ${accentColor}` }}
              >
                <div className="flex items-center gap-[10px] mb-5">
                  <Avatar name={b.name} color={col(i)} size="sm" />
                  <span className="text-sm font-semibold">{b.name}</span>
                </div>
                <p className={`mb-[2px] text-[1.75rem] leading-[1.28572] font-normal ${owed ? 'text-success' : 'text-panel'}`}>
                  {fmt(Math.abs(b.balance))}
                </p>
                <p className="text-xs tracking-[0.32px] text-muted">{statusLabel}</p>
              </Link>
            )
          })}
        </div>

        <div className="flex items-baseline justify-between mb-4">
          <h2 className="m-0 text-sm font-semibold tracking-[0.16px]">Recent expenses</h2>
          <span className="text-xs tracking-[0.32px] text-muted">
            {expenses.length} expense{expenses.length !== 1 ? 's' : ''} · {fmt(totalAmt)} total
          </span>
        </div>
        <div className="border border-subtle">
          <div className="grid grid-cols-[1fr_140px_140px_120px_40px] items-center px-4 h-10 bg-field border-b border-subtle">
            <span className="text-xs font-semibold tracking-[0.32px] text-muted">Description</span>
            <span className="text-xs font-semibold tracking-[0.32px] text-muted">Date</span>
            <span className="text-xs font-semibold tracking-[0.32px] text-muted">Split</span>
            <span className="text-xs font-semibold tracking-[0.32px] text-muted text-right">Amount</span>
            <span></span>
          </div>
          {expenses.length === 0 ? (
            <div className="px-4 py-6 text-muted text-sm">No expenses yet.</div>
          ) : expenses.map(exp => {
            const payerIdx = members.findIndex(m => m.id === exp.paid_by_id)
            const payerColor = col(payerIdx >= 0 ? payerIdx : 0)
            const payerName = exp.payer?.name || '?'
            const waysCount = exp.splits?.length || 0
            return (
              <div
                key={exp.id}
                data-testid="expense-row"
                className="grid grid-cols-[1fr_140px_140px_120px_40px] items-center px-4 min-h-14 border-b border-row transition-colors duration-[70ms] hover:bg-field-hover cursor-pointer"
                onClick={() => navigate(`/trips/${id}/members/${members[0]?.id}`)}
              >
                <div className="flex items-center gap-3 min-w-0 py-2">
                  <Avatar name={payerName} color={payerColor} size="md" />
                  <div className="min-w-0">
                    <p className="m-0 text-sm truncate">{exp.description}</p>
                    <p className="m-0 mt-0.5 text-xs text-muted">{payerName === 'You' ? 'You paid' : `${payerName} paid`}</p>
                  </div>
                </div>
                <span className="text-sm text-muted">{exp.date}</span>
                <span className="text-sm text-muted">Split {waysCount} ways</span>
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

        <CalloutBanner
          title="Ready to settle up?"
          sub="Clear all balances with the fewest possible payments."
          action={
            <ButtonLink
              to={`/trips/${id}/settle`}
              className="flex-none border border-brand bg-transparent text-brand hover:bg-[rgba(141,141,141,0.12)]"
            >
              <span>Settle up</span>
              <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M18 6l-1.43 1.393L24.15 15H4v2h20.15l-7.58 7.573L18 26l10-10z"/></svg>
            </ButtonLink>
          }
        />
      </div>

      {deleteOpen && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.6)] z-50 flex items-center justify-center p-6"
          onClick={e => { if (e.target === e.currentTarget) setDeleteOpen(false) }}
          aria-modal="true"
          role="dialog"
        >
          <div className="w-full max-w-[440px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
            <div className="flex items-start justify-between p-5 pb-2">
              <div>
                <p className="mb-[2px] text-xs tracking-[0.32px] text-muted">Driftlog</p>
                <h2 className="text-xl font-normal">Delete trip</h2>
              </div>
              <button
                onClick={() => setDeleteOpen(false)}
                aria-label="Close"
                className="w-10 h-10 border-0 bg-transparent cursor-pointer flex items-center justify-center text-muted hover:bg-field-hover"
              >
                <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4l6.6 6.6L8 22.6 9.4 24l6.6-6.6 6.6 6.6 1.4-1.4-6.6-6.6z"/></svg>
              </button>
            </div>
            <div className="px-5 pb-6 pt-4">
              <p className="text-sm leading-[1.4]">
                Permanently delete <span className="font-semibold">{trip.name}</span>? This removes the trip and all of its expenses for everyone in the group. This can't be undone.
              </p>
            </div>
            <div className="flex h-16 border-t border-subtle">
              <button
                onClick={() => setDeleteOpen(false)}
                className="flex-1 border-0 bg-panel text-white flex items-center px-4 text-sm tracking-[0.16px] cursor-pointer transition-colors duration-[110ms] hover:bg-gray-80"
              >
                Cancel
              </button>
              <Button variant="danger" onClick={confirmDelete} className="flex-1 justify-between !h-full">
                <span>Delete</span>
                <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M12 12h2v12h-2zm6 0h2v12h-2z"/>
                  <path d="M4 6v2h2l2 20h16l2-20h2V6H4zm6.5 22L8.4 8h15.2l-2.1 20h-7zM12 2h8v2h-8z"/>
                </svg>
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}
