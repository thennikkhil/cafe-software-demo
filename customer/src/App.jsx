import { Routes, Route } from 'react-router-dom'
import Home         from './pages/Home'
import ItemDetail   from './pages/ItemDetail'
import Cart         from './pages/Cart'
import Confirmation from './pages/Confirmation'

export default function App() {
  return (
    <Routes>
      <Route path='/'             element={<Home />}         />
      <Route path='/item/:id'     element={<ItemDetail />}   />
      <Route path='/cart'         element={<Cart />}         />
      <Route path='/confirmation' element={<Confirmation />} />
    </Routes>
  )
}
