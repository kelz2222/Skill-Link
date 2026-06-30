import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo.jsx'
import { supabase } from '../lib/supabase.js'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user)
        setRole(data.user.user_metadata?.role || 'customer')
      }
    })
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    navigate('/')
  }

  function getDashboardLink() {
    if (role === 'artisan') return '/artisan/dashboard'
    if (role === 'admin') return '/admin'
    return '/customer/dashboard'
  }

  return (
    <nav className={styles.nav}>
      <Link to="/"><Logo size={32} /></Link>

      <div className={styles.links}>
        <Link to="/browse" className={`${styles.link} ${pathname === '/browse' ? styles.active : ''}`}>Find Artisans</Link>
        {!user ? (
          <>
            <Link to="/login" className={`${styles.link}`}>Login</Link>
            <Link to="/register" className="btn btn-bronze btn-sm">Get Started</Link>
          </>
        ) : (
          <>
            <Link to={getDashboardLink()} className={`${styles.link}`}>Dashboard</Link>
            <button onClick={logout} className="btn btn-outline btn-sm">Logout</button>
          </>
        )}
      </div>

      <button className={styles.burger} onClick={() => setOpen(!open)}>
        <span /><span /><span />
      </button>

      {open && (
        <div className={styles.mobile}>
          <Link to="/browse" className={styles.mobileLink} onClick={() => setOpen(false)}>Find Artisans</Link>
          {!user ? (
            <>
              <Link to="/login" className={styles.mobileLink} onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" className={styles.mobileCta} onClick={() => setOpen(false)}>Get Started →</Link>
            </>
          ) : (
            <>
              <Link to={getDashboardLink()} className={styles.mobileLink} onClick={() => setOpen(false)}>Dashboard</Link>
              <button onClick={() => { logout(); setOpen(false) }} className={styles.mobileLink}>Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
