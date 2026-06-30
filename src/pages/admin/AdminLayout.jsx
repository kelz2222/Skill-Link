import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import Logo from '../../components/Logo.jsx'
import styles from './AdminLayout.module.css'

const NAV = [
  { to: '/admin', icon: '📊', label: 'Overview' },
  { to: '/admin/artisans', icon: '🔧', label: 'Artisans' },
  { to: '/admin/jobs', icon: '📋', label: 'Jobs' },
]

export default function AdminLayout({ children, title }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  async function logout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.logoWrap}><Logo size={26} /></div>
          <p className={styles.adminLabel}>Admin Panel</p>
          <nav className={styles.nav}>
            {NAV.map(n => (
              <Link key={n.to} to={n.to} className={`${styles.navItem} ${pathname === n.to ? styles.navActive : ''}`}>
                <span>{n.icon}</span><span>{n.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <button className={styles.logout} onClick={logout}>🚪 Logout</button>
      </aside>
      <div className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>{title}</h1>
          <span className={styles.live}>● LIVE</span>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}
