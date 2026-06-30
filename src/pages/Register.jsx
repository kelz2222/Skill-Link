import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import Logo from '../components/Logo.jsx'
import styles from './Auth.module.css'

const CATEGORIES = ['Electrician','Plumber','Carpenter','Painter','Welder','AC Technician','Generator Repair','Tiler','Mason','Other']

export default function Register() {
  const navigate = useNavigate()
  const [role, setRole] = useState('customer')
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', category: '', hourly_rate: '', bio: '', location: 'Umuahia, Abia State' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function handleRegister() {
    if (!form.full_name || !form.email || !form.password) { setError('Please fill all required fields.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true); setError('')

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name, role, phone: form.phone } }
    })

    if (authError) { setError(authError.message); setLoading(false); return }

    if (role === 'artisan' && data.user) {
      await supabase.from('artisans').insert([{
        id: data.user.id,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        category: form.category,
        hourly_rate: Number(form.hourly_rate) || 0,
        bio: form.bio,
        location: form.location,
        is_verified: false,
        is_available: true,
        avg_rating: 0,
        review_count: 0,
      }])
      navigate('/artisan/dashboard')
    } else {
      navigate('/customer/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/"><Logo size={28} /></Link>
        <h1 className={styles.title}>Create Account</h1>

        <div className={styles.roleToggle}>
          <button className={`${styles.roleBtn} ${role === 'customer' ? styles.roleActive : ''}`}
            onClick={() => setRole('customer')}>👤 I need a service</button>
          <button className={`${styles.roleBtn} ${role === 'artisan' ? styles.roleActive : ''}`}
            onClick={() => setRole('artisan')}>🔧 I am an artisan</button>
        </div>

        <div className={styles.form}>
          <div className="field">
            <label>Full Name *</label>
            <input placeholder="Your full name" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
          </div>
          <div className="field">
            <label>Email *</label>
            <input type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="field">
            <label>Phone Number</label>
            <input placeholder="08012345678" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div className="field">
            <label>Password *</label>
            <input type="password" placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
          </div>

          {role === 'artisan' && (
            <>
              <div className="field">
                <label>Your Trade / Category *</label>
                <select value={form.category} onChange={e => set('category', e.target.value)}>
                  <option value="">Select your skill</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Hourly Rate (₦)</label>
                <input type="number" placeholder="e.g. 3000" value={form.hourly_rate} onChange={e => set('hourly_rate', e.target.value)} />
              </div>
              <div className="field">
                <label>Short Bio</label>
                <textarea placeholder="Describe your experience and skills..." value={form.bio} onChange={e => set('bio', e.target.value)} />
              </div>
              <div className="field">
                <label>Location</label>
                <input placeholder="e.g. Umuahia, Abia State" value={form.location} onChange={e => set('location', e.target.value)} />
              </div>
            </>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button className="btn btn-navy" style={{ width: '100%', justifyContent: 'center' }}
          onClick={handleRegister} disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account →'}
        </button>

        <p className={styles.switch}>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}
