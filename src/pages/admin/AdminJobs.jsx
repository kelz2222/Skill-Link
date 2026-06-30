import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import AdminLayout from './AdminLayout.jsx'
import styles from './AdminList.module.css'

const STATUS_COLORS = { pending: 'badge-yellow', confirmed: 'badge-navy', in_progress: 'badge-bronze', completed: 'badge-green', cancelled: 'badge-red' }

export default function AdminJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchJobs() }, [])

  async function fetchJobs() {
    const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
    setJobs(data || [])
    setLoading(false)
  }

  const filtered = filter === 'all' ? jobs : jobs.filter(j => j.status === filter)

  return (
    <AdminLayout title="All Jobs">
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(f => (
            <button key={f} className={`${styles.filter} ${filter === f ? styles.active : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
        <p className={styles.count}>{filtered.length} job{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? <p className={styles.loading}>Loading...</p> : (
        <div className={styles.cards}>
          {filtered.length === 0 && <p className={styles.empty}>No jobs found.</p>}
          {filtered.map(j => (
            <div key={j.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.info}>
                  <p className={styles.name}>{j.customer_name} → {j.artisan_name}</p>
                  <p className={styles.meta}>{j.category} · {j.scheduled_date}</p>
                </div>
                <span className={`badge ${STATUS_COLORS[j.status]}`}>{j.status.replace('_',' ')}</span>
              </div>
              <p className={styles.bio}>{j.description}</p>
              <div className={styles.statsRow}>
                <span>💰 ₦{Number(j.hourly_rate).toLocaleString()}/hr</span>
                <span>📊 Commission: ₦{(j.hourly_rate * (j.commission_rate || 0.1)).toLocaleString()}</span>
                <span>📍 {j.address}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
