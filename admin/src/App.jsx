import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Orders from './pages/Orders'
import Menu from './pages/Menu'
import Analytics from './pages/Analytics'

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<Navigate to='/orders' replace />} />
        <Route path='orders'    element={<Orders />} />
        <Route path='menu'      element={<Menu />} />
        <Route path='analytics' element={<Analytics />} />
      </Route>
    </Routes>
  )
}
