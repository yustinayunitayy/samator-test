import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout/Layout'
import Dashboard from './pages/Dashboard'
import Cylinders from './pages/Database'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cylinders" element={<Cylinders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}