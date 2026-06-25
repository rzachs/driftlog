import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Login from './pages/Login'
import Trips from './pages/Trips'
import TripOverview from './pages/TripOverview'
import AddExpense from './pages/AddExpense'
import PersonDetail from './pages/PersonDetail'
import SettleUp from './pages/SettleUp'

// spec row 7: redirect to login if no valid session
function AuthGuard() {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    fetch('/api/me')
      .then(r => r.ok ? setStatus('ok') : setStatus('unauth'))
      .catch(() => setStatus('unauth'))
  }, [])

  if (status === 'loading') return null
  if (status === 'unauth') return <Navigate to="/" replace />
  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route element={<AuthGuard />}>
        <Route path="/trips" element={<Trips />} />
        <Route path="/trips/:id" element={<TripOverview />} />
        <Route path="/trips/:id/add-expense" element={<AddExpense />} />
        <Route path="/trips/:tripId/members/:memberId" element={<PersonDetail />} />
        <Route path="/trips/:tripId/settle" element={<SettleUp />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
