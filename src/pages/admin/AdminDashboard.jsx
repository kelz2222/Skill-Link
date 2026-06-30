import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import AdminLayout from './AdminLayout.jsx'
import styles from './AdminDashboard.module.css'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ artisans: 0, pendingVerify: 0, jobs: 0, revenue: 0, commission: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user || data.user.user_metadata?.role !== 'admin') { navigate('/login'); return }
      fetchStats()
    })
  }, [])

  async function fetchStats() {
    const [artisansRes, jobsRes] = await Promise.all([
      supabase.from('artisans').select('*'),
      supabase.from('jobs').select('*'),
    ])
    const artisans = artisansRes.data || []
    const jobs = jobsRes.data || []
    const completed = jobs.filter(j => j.status === 'completed')
    const revenue = completed.reduce((s, j) => s + (j.hourly_rate || 0), 0)
    const commission = completed.reduce((s, j) => s + (j.hourly_rate * (j.commission_rate || 0.1)), 0)

    setStats({
      artisans: artisans.length,
      pendingVerify: artisans.filter(a => !a.is_verified).length,
      jobs: jobs.length,
      revenue,
      commission,
    })
    setLoading(false)
  }

  const cards = [
    { label: 'Total Artisans', value: stats.artisans, icon: '🔧', color: 'var(--navy)' },
    { label: 'Pending Verification', value: stats.pendingVerify, icon: '⏳', color: '#854D0E' },
    { label: 'Total Jobs', value: stats.jobs, icon: '📋', color: 'var(--bronze)' },
    { label: 'Platform Commission', value: `₦${stats.commission.toLocaleString()}`, icon: '💰', color: 'var(--green)' },
  ]

  return (
    <AdminLayout title="Overview">
      {loading ? <p className={styles.loading}>Loading...</p> : (
        <>
          <div className={styles.statsGrid}>
            {cards.map(c => (
              <div key={c.label} className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: c.color + '18' }}>{c.icon}</div>
                <div>
                  <p className={styles.statValue} style={{ color: c.color }}>{c.value}</p>
                  <p className={styles.statLabel}>{c.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Platform Summary</h2>
            <div className={styles.summaryRow}><span>Gross job value (completed)</span><span>₦{stats.revenue.toLocaleString()}</span></div>
            <div className={styles.summaryRow}><span>Skill Link commission (10%)</span><span className={styles.green}>₦{stats.commission.toLocaleString()}</span></div>
            <div className={styles.summaryRow}><span>Paid out to artisans</span><span>₦{(stats.revenue - stats.commission).toLocaleString()}</span></div>
          </div>

          {stats.pendingVerify > 0 && (
            <div className={styles.alert}>
              ⚠️ {stats.pendingVerify} artisan{stats.pendingVerify !== 1 ? 's' : ''} waiting for verification.
              <a href="/admin/artisans" className={styles.alertLink}>Review now →</a>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  )
}
