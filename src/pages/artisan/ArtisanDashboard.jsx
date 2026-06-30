import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import Logo from '../../components/Logo.jsx'
import styles from './ArtisanDashboard.module.css'

const STATUS_COLORS = { pending: 'badge-yellow', confirmed: 'badge-navy', in_progress: 'badge-bronze', completed: 'badge-green', cancelled: 'badge-red' }

export default function ArtisanDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) { navigate('/login'); return }
      if (data.user.user_metadata?.role !== 'artisan') { navigate('/customer/dashboard'); return }
      setUser(data.user)
      fetchProfile(data.user.id)
      fetchJobs(data.user.id)
    })
  }, [])

  async function fetchProfile(uid) {
    const { data } = await supabase.from('artisans').select('*').eq('id', uid).single()
    setProfile(data)
  }

  async function fetchJobs(uid) {
    const { data } = await supabase.from('jobs').select('*').eq('artisan_id', uid).order('created_at', { ascending: false })
    setJobs(data || [])
    setLoading(false)
  }

  async function updateJobStatus(id, status) {
    await supabase.from('jobs').update({ status }).eq('id', id)
    fetchJobs(user.id)
  }

  async function toggleAvailability() {
    const newStatus = !profile.is_available
    await supabase.from('artisans').update({ is_available: newStatus }).eq('id', user.id)
    setProfile(p => ({ ...p, is_available: newStatus }))
  }

  const pending = jobs.filter(j => j.status === 'pending')
  const active = jobs.filter(j => ['confirmed', 'in_progress'].includes(j.status))
  const completed = jobs.filter(j => j.status === 'completed')

  const totalEarnings = completed.reduce((sum, j) => sum + (j.hourly_rate * (1 - (j.commission_rate || 0.1))), 0)
  const totalCommission = completed.reduce((sum, j) => sum + (j.hourly_rate * (j.commission_rate || 0.1)), 0)

  const TABS = {
    pending: { label: `New Requests (${pending.length})`, data: pending },
    active: { label: `Active Jobs (${active.length})`, data: active },
    completed: { label: `Completed (${completed.length})`, data: completed },
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Logo size={28} />
        <div className={styles.headerRight}>
          {profile && (
            <button className={styles.availToggle} onClick={toggleAvailability}>
              <span className={`${styles.dot} ${profile.is_available ? styles.dotGreen : styles.dotGray}`} />
              {profile.is_available ? 'Available' : 'Unavailable'}
            </button>
          )}
          <button onClick={() => { supabase.auth.signOut(); navigate('/') }} className={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      <div className={styles.content}>
        {!profile?.is_verified && (
          <div className={styles.verifyBanner}>
            ⏳ Your profile is pending verification. You'll appear in search results once approved by Skill Link admin.
          </div>
        )}

        <h1 className={styles.welcomeTitle}>Welcome, {profile?.full_name}</h1>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={styles.statIcon}>💰</p>
            <p className={styles.statValue}>₦{totalEarnings.toLocaleString()}</p>
            <p className={styles.statLabel}>Total Earnings</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statIcon}>✅</p>
            <p className={styles.statValue}>{completed.length}</p>
            <p className={styles.statLabel}>Jobs Completed</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statIcon}>⭐</p>
            <p className={styles.statValue}>{(profile?.avg_rating || 0).toFixed(1)}</p>
            <p className={styles.statLabel}>Average Rating</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statIcon}>📊</p>
            <p className={styles.statValue}>₦{totalCommission.toLocaleString()}</p>
            <p className={styles.statLabel}>Commission Paid</p>
          </div>
        </div>

        <div className={styles.tabs}>
          {Object.entries(TABS).map(([key, t]) => (
            <button key={key} className={`${styles.tab} ${tab === key ? styles.tabActive : ''}`} onClick={() => setTab(key)}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? <p className={styles.loading}>Loading jobs...</p> : (
          <div className={styles.jobGrid}>
            {TABS[tab].data.length === 0 ? (
              <div className={styles.empty}>
                <p style={{ fontSize: 40 }}>📭</p>
                <p>No jobs in this category yet.</p>
              </div>
            ) : TABS[tab].data.map(job => (
              <div key={job.id} className={styles.jobCard}>
                <div className={styles.jobTop}>
                  <div>
                    <p className={styles.jobCustomer}>{job.customer_name}</p>
                    <p className={styles.jobCategory}>{job.category}</p>
                  </div>
                  <span className={`badge ${STATUS_COLORS[job.status]}`}>{job.status.replace('_',' ')}</span>
                </div>
                <p className={styles.jobDesc}>{job.description}</p>
                <div className={styles.jobMeta}>
                  <span>📅 {job.scheduled_date}</span>
                  <span>📍 {job.address}</span>
                </div>
                <div className={styles.jobEarning}>
                  <span>Job rate: ₦{Number(job.hourly_rate).toLocaleString()}/hr</span>
                  <span className={styles.youGet}>You get: ₦{(job.hourly_rate * (1 - (job.commission_rate || 0.1))).toLocaleString()}</span>
                </div>

                <div className={styles.jobActions}>
                  {job.status === 'pending' && (
                    <>
                      <button className={styles.acceptBtn} onClick={() => updateJobStatus(job.id, 'confirmed')}>✅ Accept Job</button>
                      <button className={styles.declineBtn} onClick={() => updateJobStatus(job.id, 'cancelled')}>Decline</button>
                    </>
                  )}
                  {job.status === 'confirmed' && (
                    <button className={styles.acceptBtn} onClick={() => updateJobStatus(job.id, 'in_progress')}>🔨 Start Job</button>
                  )}
                  {job.status === 'in_progress' && (
                    <button className={styles.completeBtn} onClick={() => updateJobStatus(job.id, 'completed')}>✅ Mark Completed</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
