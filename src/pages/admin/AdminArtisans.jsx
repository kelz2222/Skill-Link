import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import AdminLayout from './AdminLayout.jsx'
import styles from './AdminList.module.css'

export default function AdminArtisans() {
  const [artisans, setArtisans] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => { fetchArtisans() }, [])

  async function fetchArtisans() {
    const { data } = await supabase.from('artisans').select('*').order('created_at', { ascending: false })
    setArtisans(data || [])
    setLoading(false)
  }

  async function verify(id, status) {
    await supabase.from('artisans').update({ is_verified: status }).eq('id', id)
    fetchArtisans()
  }

  async function toggleAvailable(id, current) {
    await supabase.from('artisans').update({ is_available: !current }).eq('id', id)
    fetchArtisans()
  }

  const filtered = filter === 'pending' ? artisans.filter(a => !a.is_verified)
    : filter === 'verified' ? artisans.filter(a => a.is_verified)
    : artisans

  return (
    <AdminLayout title="Manage Artisans">
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {['pending', 'verified', 'all'].map(f => (
            <button key={f} className={`${styles.filter} ${filter === f ? styles.active : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <p className={styles.count}>{filtered.length} artisan{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? <p className={styles.loading}>Loading...</p> : (
        <div className={styles.cards}>
          {filtered.length === 0 && <p className={styles.empty}>No artisans found.</p>}
          {filtered.map(a => (
            <div key={a.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.avatar}>{a.full_name?.[0]}</div>
                <div className={styles.info}>
                  <p className={styles.name}>{a.full_name}</p>
                  <p className={styles.meta}>{a.category} · {a.phone}</p>
                  <p className={styles.meta}>{a.email}</p>
                </div>
                <div className={styles.badges}>
                  <span className={`badge ${a.is_verified ? 'badge-green' : 'badge-yellow'}`}>
                    {a.is_verified ? 'Verified' : 'Pending'}
                  </span>
                  <span className={`badge ${a.is_available ? 'badge-navy' : 'badge-red'}`}>
                    {a.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              <p className={styles.bio}>{a.bio || 'No bio provided.'}</p>

              <div className={styles.statsRow}>
                <span>⭐ {(a.avg_rating || 0).toFixed(1)} ({a.review_count || 0} reviews)</span>
                <span>₦{Number(a.hourly_rate || 0).toLocaleString()}/hr</span>
                <span>📍 {a.location}</span>
              </div>

              <div className={styles.actions}>
                {!a.is_verified ? (
                  <button className={styles.verifyBtn} onClick={() => verify(a.id, true)}>✅ Verify Artisan</button>
                ) : (
                  <button className={styles.unverifyBtn} onClick={() => verify(a.id, false)}>Revoke Verification</button>
                )}
                <button className={styles.toggleBtn} onClick={() => toggleAvailable(a.id, a.is_available)}>
                  {a.is_available ? 'Mark Unavailable' : 'Mark Available'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
