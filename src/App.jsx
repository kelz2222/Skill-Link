import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Browse from './pages/Browse.jsx'
import ArtisanProfile from './pages/ArtisanProfile.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import CustomerDashboard from './pages/customer/CustomerDashboard.jsx'
import ArtisanDashboard from './pages/artisan/ArtisanDashboard.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminArtisans from './pages/admin/AdminArtisans.jsx'
import AdminJobs from './pages/admin/AdminJobs.jsx'

const GuestLayout = ({ children }) => <><Navbar />{children}<Footer /></>

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GuestLayout><Home /></GuestLayout>} />
      <Route path="/browse" element={<GuestLayout><Browse /></GuestLayout>} />
      <Route path="/artisan/:id" element={<GuestLayout><ArtisanProfile /></GuestLayout>} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/customer/dashboard" element={<CustomerDashboard />} />
      <Route path="/artisan/dashboard" element={<ArtisanDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/artisans" element={<AdminArtisans />} />
      <Route path="/admin/jobs" element={<AdminJobs />} />
    </Routes>
  )
}
