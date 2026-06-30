import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import Logo from '../components/Logo.jsx'
import styles from './Auth.module.css'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email || !password) { setError('Please fill all fields.'); return }
    setLoading(true); setError('')
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError(authError.message); setLoading(false); return }
    const role = data.user?.user_metadata?.role || 'customer'
    if (role === 'artisan') navigate('/artisan/dashboard')
    else if (role === 'admin') navigate('/admin')
    else navigate('/customer/dashboard')
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/"><Logo size={28} /></Link>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.sub}>Login to your Skill Link account</p>

        <div className={styles.form}>
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@email.com" value={email}
              onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="Your password" value={password}
              onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button className="btn btn-navy" style={{ width: '100%', justifyContent: 'center' }}
          onClick={handleLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Login →'}
        </button>

        <p className={styles.switch}>No account yet? <Link to="/register">Register free</Link></p>

        <div className={styles.adminHint}>
          <p>Admin login: use email with admin role set in Supabase</p>
        </div>
      </div>
    </div>
  )
}
