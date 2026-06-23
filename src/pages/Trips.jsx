import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import Avatar from '../components/Avatar'
import { Button } from '../components/Button'
import { col, fmtDateRange, fmtBal } from '../utils'

function TripCard({ trip, onDelete }) {
  const isActive = trip.start_date && new Date(trip.start_date) <= new Date() &&
    (!trip.end_date || new Date(trip.end_date) >= new Date())
  const bal = trip.myBalance
  const settled = Math.abs(bal) < 0.005
  const balStr = settled ? 'Settled' : fmtBal(bal)
  const balLabel = settled ? 'All cleared' : (bal > 0 ? "You're owed" : 'You owe')
  const balColor = settled ? 'text-muted' : (bal > 0 ? 'text-success' : 'text-panel')

  return (
    <Link
      to={`/trips/${trip.id}`}
      data-testid="trip-row"
      className="group flex items-center gap-6 py-5 px-6 border-b border-row no-underline text-panel transition-colors duration-[70ms] hover:bg-field-hover"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[10px] mb-2">
          <span className="text-base font-semibold">{trip.name}</span>
          {isActive && (
            <span className="text-[0.6875rem] tracking-[0.32px] text-badge bg-badge-bg py-px px-2 rounded-full">Active</span>
          )}
        </div>
        <div className="flex items-center gap-[14px] flex-wrap">
          <span className="inline-flex items-center gap-[6px] text-[0.8125rem] text-muted">
            <svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor" className="opacity-[0.55]">
              <path d="M26 4h-4V2h-2v2h-8V2h-2v2H6C4.9 4 4 4.9 4 6v20c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 22H6V12h20v14zm0-16H6V6h4v2h2V6h8v2h2V6h4v4z"/>
            </svg>
            {fmtDateRange(trip.start_date, trip.end_date)}
          </span>
          <span className="w-px h-[14px] bg-subtle"></span>
          <div className="flex items-center">
            {trip.members.slice(0, 4).map((m, i) => (
              <div key={m.id} className={i > 0 ? '-ml-[5px]' : ''}>
                <Avatar name={m.name} color={col(i)} size="sm" />
              </div>
            ))}
            {trip.members.length > 4 && (
              <div className="w-6 h-6 rounded-full bg-helper text-white flex items-center justify-center text-[0.625rem] font-semibold -ml-[5px] border-2 border-white flex-none">
                +{trip.members.length - 4}
              </div>
            )}
            <span className="ml-[10px] text-[0.8125rem] text-muted">{trip.members.length} people</span>
          </div>
        </div>
      </div>
      <div className="text-right flex-none">
        <p className={`m-0 mb-[2px] text-lg font-normal tabular-nums ${balColor}`}>{balStr}</p>
        <p className="m-0 text-xs tracking-[0.32px] text-muted">{balLabel}</p>
      </div>
      <button
        type="button"
        data-testid="delete-trip-btn"
        onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete(trip) }}
        aria-label="Delete trip"
        title="Delete trip"
        className="flex-none w-10 h-10 -my-2 border-0 bg-transparent cursor-pointer flex items-center justify-center text-muted opacity-0 group-hover:opacity-100 focus:opacity-100 transition-colors duration-[70ms] hover:bg-danger-bg hover:text-danger"
      >
        <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor">
          <path d="M12 12h2v12h-2zm6 0h2v12h-2z"/>
          <path d="M4 6v2h2l2 20h16l2-20h2V6H4zm6.5 22L8.4 8h15.2l-2.1 20h-7zM12 2h8v2h-8z"/>
        </svg>
      </button>
      <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" className="opacity-40 flex-none">
        <path d="M22 16L12 26l-1.414-1.414L19.172 16l-8.586-8.586L12 6z"/>
      </svg>
    </Link>
  )
}

export default function Trips() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [tripName, setTripName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [participants, setParticipants] = useState(['You', 'Maya', 'Sam'])
  const [newPerson, setNewPerson] = useState('')
  const [deleteTrip, setDeleteTrip] = useState(null)

  useEffect(() => {
    fetch('/api/trips').then(r => r.json()).then(data => { setTrips(data); setLoading(false) })
  }, [])

  const active = trips.filter(t =>
    t.start_date && new Date(t.start_date) <= new Date() &&
    (!t.end_date || new Date(t.end_date) >= new Date())
  )

  function handleNewPersonKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = newPerson.trim()
      if (val) { setParticipants(p => [...p, val]); setNewPerson('') }
    }
  }

  function closeModal() {
    setShowModal(false)
    setTripName('')
    setStartDate('')
    setEndDate('')
    setParticipants(['You', 'Maya', 'Sam'])
  }

  async function createTrip() {
    if (!tripName.trim()) return
    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: tripName, startDate: startDate || null, endDate: endDate || null, people: participants }),
    })
    const { id } = await res.json()
    navigate(`/trips/${id}`)
  }

  async function confirmDelete() {
    await fetch(`/api/trips/${deleteTrip.id}`, { method: 'DELETE' })
    setTrips(ts => ts.filter(t => t.id !== deleteTrip.id))
    setDeleteTrip(null)
  }

  return (
    <div className="font-sans bg-field text-panel min-h-screen">
      <Header subtitle="Trips" />

      <main className="max-w-[880px] mx-auto px-4 pt-12 pb-20">
        <div className="flex items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-[2rem] leading-[1.25] font-normal mb-[6px]">Your trips</h1>
            <p className="text-sm text-muted">
              {loading ? 'Loading…' : `${trips.length} trip${trips.length !== 1 ? 's' : ''} · ${active.length} active`}
            </p>
          </div>
          <Button onClick={() => setShowModal(true)} className="flex-none">
            <span className="whitespace-nowrap">Create trip</span>
            <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M17 15V8h-2v7H8v2h7v7h2v-7h7v-2z"/></svg>
          </Button>
        </div>

        <div className="border border-subtle bg-white">
          {loading ? (
            <div className="p-10 text-center text-muted">Loading trips…</div>
          ) : trips.length === 0 ? (
            <div className="p-10 text-center text-muted">No trips yet — create your first one.</div>
          ) : (
            trips.map(trip => <TripCard key={trip.id} trip={trip} onDelete={setDeleteTrip} />)
          )}
        </div>
      </main>

      {showModal && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.6)] z-50 flex items-center justify-center p-6"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
          aria-modal="true"
          role="dialog"
        >
          <div className="w-full max-w-[480px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
            <div className="flex items-start justify-between p-5 pb-2">
              <div>
                <p className="mb-[2px] text-xs tracking-[0.32px] text-muted">Driftlog</p>
                <h2 className="text-xl font-normal">Create trip</h2>
              </div>
              <button
                onClick={closeModal}
                aria-label="Close"
                className="w-10 h-10 border-0 bg-transparent cursor-pointer flex items-center justify-center text-muted hover:bg-field-hover"
              >
                <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4l6.6 6.6L8 22.6 9.4 24l6.6-6.6 6.6 6.6 1.4-1.4-6.6-6.6z"/></svg>
              </button>
            </div>

            <div className="px-5 pb-6 pt-4">
              <label className="block text-xs tracking-[0.32px] text-muted mb-2">Trip name</label>
              <input
                type="text"
                value={tripName}
                onChange={e => setTripName(e.target.value)}
                placeholder="e.g. Lisbon long weekend"
                className="w-full h-12 border-0 border-b border-strong bg-field text-panel text-sm px-4 mb-6"
              />
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs tracking-[0.32px] text-muted mb-2">Start date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="w-full h-12 border-0 border-b border-strong bg-field text-panel text-sm px-4" />
                </div>
                <div>
                  <label className="block text-xs tracking-[0.32px] text-muted mb-2">End date</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                    className="w-full h-12 border-0 border-b border-strong bg-field text-panel text-sm px-4" />
                </div>
              </div>

              <label className="block text-xs tracking-[0.32px] text-muted mb-2">People</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {participants.map((name, i) => (
                  <span key={i} className="inline-flex items-center gap-[6px] h-8 pl-3 pr-1 bg-gray-80 text-white text-[0.8125rem] rounded-full">
                    {name}
                    {name !== 'You' && (
                      <button
                        type="button"
                        onClick={() => setParticipants(p => p.filter((_, j) => j !== i))}
                        className="w-6 h-6 border-0 bg-transparent cursor-pointer rounded-full flex items-center justify-center p-0 hover:bg-[rgba(255,255,255,0.25)]"
                      >
                        <svg width="14" height="14" viewBox="0 0 32 32" fill="white"><path d="M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4l6.6 6.6L8 22.6 9.4 24l6.6-6.6 6.6 6.6 1.4-1.4-6.6-6.6z"/></svg>
                      </button>
                    )}
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={newPerson}
                onChange={e => setNewPerson(e.target.value)}
                onKeyDown={handleNewPersonKey}
                placeholder="Type a name, press Enter to add"
                className="w-full h-10 border-0 border-b border-strong bg-field text-panel text-sm px-4"
              />
            </div>

            <div className="flex h-16 border-t border-subtle">
              <button onClick={closeModal} className="flex-1 border-0 bg-panel text-white flex items-center px-4 text-sm tracking-[0.16px] cursor-pointer transition-colors duration-[110ms] hover:bg-gray-80">
                Cancel
              </button>
              <Button onClick={createTrip} className="flex-1 justify-between !h-full">
                <span>Create trip</span>
                <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M18 6l-1.43 1.393L24.15 15H4v2h20.15l-7.58 7.573L18 26l10-10z"/></svg>
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteTrip && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.6)] z-50 flex items-center justify-center p-6"
          onClick={e => { if (e.target === e.currentTarget) setDeleteTrip(null) }}
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
                onClick={() => setDeleteTrip(null)}
                aria-label="Close"
                className="w-10 h-10 border-0 bg-transparent cursor-pointer flex items-center justify-center text-muted hover:bg-field-hover"
              >
                <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4l6.6 6.6L8 22.6 9.4 24l6.6-6.6 6.6 6.6 1.4-1.4-6.6-6.6z"/></svg>
              </button>
            </div>
            <div className="px-5 pb-6 pt-4">
              <p className="text-sm leading-[1.4]">
                Permanently delete <span className="font-semibold">{deleteTrip.name}</span>? This removes the trip and all of its expenses for everyone in the group. This can't be undone.
              </p>
            </div>
            <div className="flex h-16 border-t border-subtle">
              <button
                onClick={() => setDeleteTrip(null)}
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
    </div>
  )
}
