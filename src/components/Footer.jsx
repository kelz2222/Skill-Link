import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Logo size={28} />
          <p className={styles.tagline}>Connecting skilled artisans with people who need them — right here in Umuahia.</p>
        </div>
        <div className={styles.cols}>
          <div>
            <p className={styles.colHead}>Platform</p>
            <Link to="/browse">Find Artisans</Link>
            <Link to="/register">Become an Artisan</Link>
            <Link to="/login">Login</Link>
          </div>
          <div>
            <p className={styles.colHead}>Categories</p>
            <p>Electricians</p>
            <p>Plumbers</p>
            <p>Carpenters</p>
            <p>AC Technicians</p>
          </div>
          <div>
            <p className={styles.colHead}>Contact</p>
            <p>Umuahia, Abia State</p>
            <p>Nigeria</p>
            <a href="mailto:hello@skilllink.ng">hello@skilllink.ng</a>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>© 2026 Skill Link. All rights reserved.</p>
        <p>10% commission on completed jobs</p>
      </div>
    </footer>
  )
}
