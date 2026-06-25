import { useEffect, useState, createContext, useContext } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'

export const UserContext = createContext(null)
import Login from './pages/Login'
import Trips from './pages/Trips'
import TripOverview from './pages/TripOverview'
import AddExpense from './pages/AddExpense'
import PersonDetail from './pages/PersonDetail'
import SettleUp from './pages/SettleUp'

// spec row 7: redirect to login if no valid session; populate UserContext for children
function AuthGuard() {
  const [status, setStatus] = useState('loading')
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch('/api/me')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(u => { setUser(u); setStatus('ok') })
      .catch(() => setStatus('unauth'))
  }, [])

  if (status === 'loading') return null
  if (status === 'unauth') return <Navigate to="/" replace />
  return <UserContext.Provider value={user}><Outlet /></UserContext.Provider>
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
