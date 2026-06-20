import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Trips from './pages/Trips'
import TripOverview from './pages/TripOverview'
import AddExpense from './pages/AddExpense'
import PersonDetail from './pages/PersonDetail'
import SettleUp from './pages/SettleUp'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/trips" element={<Trips />} />
      <Route path="/trips/:id" element={<TripOverview />} />
      <Route path="/trips/:id/add-expense" element={<AddExpense />} />
      <Route path="/trips/:tripId/members/:memberId" element={<PersonDetail />} />
      <Route path="/trips/:tripId/settle" element={<SettleUp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
