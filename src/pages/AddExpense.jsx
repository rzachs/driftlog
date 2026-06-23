import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageShell from '../components/PageShell'
import Avatar from '../components/Avatar'
import BackLink from '../components/BackLink'
import { Button, ButtonLink } from '../components/Button'
import { col, fmt } from '../utils'

export default function AddExpense() {
  const { id: tripId } = useParams()
  const navigate = useNavigate()

  const [trip, setTrip] = useState(null)
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [payerId, setPayerId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [method, setMethod] = useState('even')
  const [selected, setSelected] = useState({})
  const [custom, setCustom] = useState({})

  useEffect(() => {
    if (!tripId) { navigate('/trips'); return }
    fetch(`/api/trips/${tripId}`)
      .then(r => r.json())
      .then(data => {
        setTrip(data)
        setPayerId(data.members[0]?.id || '')
        const sel = {}, cust = {}
        data.members.forEach(m => { sel[m.id] = true; cust[m.id] = '' })
        setSelected(sel)
        setCustom(cust)
      })
  }, [tripId])

  const members = trip?.members || []
  const total = parseFloat(amount) || 0
  const selMembers = members.filter(m => selected[m.id])
  const evenShare = selMembers.length ? total / selMembers.length : 0
  const customSum = selMembers.reduce((a, m) => a + (parseFloat(custom[m.id]) || 0), 0)
  const remaining = total - customSum
  const isCustom = method === 'custom'

  let noteText = '', noteColor = 'text-muted'
  if (isCustom) {
    const r = Math.round(remaining * 100) / 100
    if (Math.abs(r) < 0.005) { noteText = 'Fully allocated'; noteColor = 'text-success' }
    else if (r > 0) { noteText = `${fmt(r)} left`; noteColor = 'text-danger' }
    else { noteText = `${fmt(-r)} over`; noteColor = 'text-danger' }
  } else {
    noteText = `${selMembers.length} people · ${fmt(evenShare)} each`
  }

  async function addExpense() {
    if (!total || !desc || !payerId || !date || !selMembers.length) return
    const splits = selMembers.map(m => ({
      personId: m.id,
      amount: isCustom ? (parseFloat(custom[m.id]) || 0) : total / selMembers.length,
    }))
    await fetch(`/api/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: desc, amount: total, paidById: payerId, date, splits }),
    })
    navigate(`/trips/${tripId}`)
  }

  if (!trip) return (
    <PageShell maxWidth="640px">
      <div className="p-10 text-center text-muted">Loading…</div>
    </PageShell>
  )

  return (
    <div className="font-sans bg-white text-panel">
      <PageShell maxWidth="640px">
        <BackLink to={`/trips/${tripId}`}>{trip.name}</BackLink>
        <h1 className="mb-10 text-[1.75rem] leading-[1.28572] font-normal">Add expense</h1>

        <label className="block text-xs tracking-[0.32px] text-muted mb-2">Amount</label>
        <div className="flex items-stretch mb-8 border-b border-strong bg-field">
          <span className="flex items-center px-4 text-[1.75rem] font-light text-muted">€</span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 h-16 border-0 bg-transparent text-panel text-[1.75rem] font-light p-0 tabular-nums"
          />
        </div>

        <label className="block text-xs tracking-[0.32px] text-muted mb-2">Description</label>
        <input
          type="text"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="e.g. Dinner at Time Out Market"
          className="w-full h-12 border-0 border-b border-strong bg-field text-panel text-sm px-4 mb-8"
        />

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-xs tracking-[0.32px] text-muted mb-2">Paid by</label>
            <div className="relative">
              <select
                value={payerId}
                onChange={e => setPayerId(e.target.value)}
                className="w-full h-12 border-0 border-b border-strong bg-field text-panel text-sm pl-4 pr-10 appearance-none cursor-pointer"
              >
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" className="absolute right-4 top-4 pointer-events-none opacity-70">
                <path d="M16 22L6 12l1.414-1.414L16 19.172l8.586-8.586L26 12z"/>
              </svg>
            </div>
          </div>
          <div>
            <label className="block text-xs tracking-[0.32px] text-muted mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full h-12 border-0 border-b border-strong bg-field text-panel text-sm px-4"
            />
          </div>
        </div>

        <label className="block text-xs tracking-[0.32px] text-muted mb-3">Split method</label>
        <div className="flex gap-8 mb-8">
          {[['even', 'Split evenly'], ['custom', 'Custom amounts']].map(([m, label]) => (
            <label key={m} className="flex items-center gap-2 cursor-pointer text-sm" onClick={() => setMethod(m)}>
              <span className="w-[18px] h-[18px] rounded-full border border-strong flex items-center justify-center cursor-pointer flex-none">
                {method === m && <span className="w-2 h-2 rounded-full bg-brand block"></span>}
              </span>
              <span>{label}</span>
            </label>
          ))}
        </div>

        <div className="flex items-baseline justify-between mb-3">
          <label className="text-xs tracking-[0.32px] text-muted">Split between</label>
          <span className={`text-xs tracking-[0.32px] ${noteColor}`}>{noteText}</span>
        </div>
        <div className="border border-subtle mb-12">
          {members.map((m, i) => {
            const checked = !!selected[m.id]
            return (
              <div
                key={m.id}
                data-member={m.name}
                className={`flex items-center gap-3 px-4 min-h-14${i < members.length - 1 ? ' border-b border-row' : ''} ${checked ? 'bg-white' : 'bg-field'}`}
              >
                <span
                  className="w-[18px] h-[18px] flex-none border flex items-center justify-center cursor-pointer"
                  style={{ background: checked ? '#0f62fe' : 'transparent', borderColor: checked ? '#0f62fe' : '#8d8d8d' }}
                  onClick={() => setSelected(s => ({ ...s, [m.id]: !s[m.id] }))}
                >
                  {checked && (
                    <svg width="14" height="14" viewBox="0 0 32 32" fill="white">
                      <path d="M13 24L4 15l1.414-1.414L13 21.171 26.586 7.586 28 9z"/>
                    </svg>
                  )}
                </span>
                <Avatar name={m.name} color={col(i)} size="sm" />
                <span
                  className={`flex-1 text-sm cursor-pointer ${checked ? 'text-panel' : 'text-muted'}`}
                  onClick={() => setSelected(s => ({ ...s, [m.id]: !s[m.id] }))}
                >
                  {m.name}
                </span>
                {isCustom ? (
                  <div className="flex items-center gap-1" style={{ opacity: checked ? 1 : 0.35 }}>
                    <span className="text-sm text-muted">€</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      data-person={m.name}
                      value={custom[m.id]}
                      disabled={!checked}
                      onChange={e => setCustom(c => ({ ...c, [m.id]: e.target.value }))}
                      style={{
                        width: 80, height: 40, border: 'none',
                        borderBottom: '1px solid #8d8d8d', background: '#ffffff',
                        color: '#161616', fontSize: '0.875rem', padding: '0 8px',
                        textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontFamily: 'inherit',
                      }}
                    />
                  </div>
                ) : (
                  <span className={`text-sm tabular-nums ${checked ? 'text-panel' : 'text-muted'}`}>
                    {checked ? fmt(evenShare) : '—'}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </PageShell>

      <div className="fixed bottom-0 left-0 right-0 flex h-16 border-t border-subtle">
        <ButtonLink
          to={`/trips/${tripId}`}
          variant="secondary"
          className="flex-1 max-w-[50%] justify-start"
        >
          Cancel
        </ButtonLink>
        <Button
          onClick={addExpense}
          className="flex-1 max-w-[50%]"
        >
          <span>Add expense</span>
          <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M17 15V8h-2v7H8v2h7v7h2v-7h7v-2z"/></svg>
        </Button>
      </div>
    </div>
  )
}
