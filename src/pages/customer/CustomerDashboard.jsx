import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import Logo from '../../components/Logo.jsx'
import styles from './CustomerDashboard.module.css'

const STATUS_COLORS = { pending: 'badge-yellow', confirmed: 'badge-navy', in_progress: 'badge-bronze', completed: 'badge-green', cancelled: 'badge-red' }

export default function CustomerDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewJob, setReviewJob] = useState(null)
  const [review, setReview] = useState({ rating: 5, comment: '' })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) { navigate('/login'); return }
      if (data.user.user_metadata?.role === 'artisan') { navigate('/artisan/dashboard'); return }
      setUser(data.user)
      fetchJobs(data.user.id)
    })
  }, [])

  async function fetchJobs(uid) {
    const { data } = await supabase.from('jobs').select('*').eq('customer_id', uid).order('created_at', { ascending: false })
    setJobs(data || [])
    setLoading(false)
  }

  async function submitReview() {
    await supabase.from('reviews').insert([{
      artisan_id: reviewJob.artisan_id,
      customer_id: user.id,
      customer_name: user.user_metadata?.full_name || 'Customer',
      job_id: reviewJob.id,
      rating: review.rating,
      comment: review.comment,
    }])
    await supabase.from('jobs').update({ reviewed: true }).eq('id', reviewJob.id)
    setReviewJob(null)
    fetchJobs(user.id)
  }

  async function cancelJob(id) {
    await supabase.from('jobs').update({ status: 'cancelled' }).eq('id', id)
    fetchJobs(user.id)
  }

  const active = jobs.filter(j => ['pending','confirmed','in_progress'].includes(j.status))
  const history = jobs.filter(j => ['completed','cancelled'].includes(j.status))

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Logo size={28} />
        <div className={styles.headerRight}>
          <span className={styles.userName}>👤 {user?.user_metadata?.full_name}</span>
          <button onClick={() => { supabase.auth.signOut(); navigate('/') }} className={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.welcome}>
          <h1 className={styles.welcomeTitle}>My Jobs</h1>
          <Link to="/browse" className="btn btn-bronze btn-sm">+ Book New Artisan</Link>
        </div>

        {loading ? <p className={styles.loading}>Loading your jobs...</p> : (
          <>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Active Jobs ({active.length})</h2>
              {active.length === 0 ? (
                <div className={styles.empty}>
                  <p>🔧</p>
                  <p>No active jobs. <Link to="/browse">Find an artisan</Link></p>
                </div>
              ) : (
                <div className={styles.jobGrid}>
                  {active.map(job => (
                    <div key={job.id} className={styles.jobCard}>
                      <div className={styles.jobTop}>
                        <div>
                          <p className={styles.jobArtisan}>{job.artisan_name}</p>
                          <p className={styles.jobCategory}>{job.category}</p>
                        </div>
                        <span className={`badge ${STATUS_COLORS[job.status]}`}>{job.status.replace('_', ' ')}</span>
                      </div>
                      <p className={styles.jobDesc}>{job.description}</p>
                      <div className={styles.jobMeta}>
                        <span>📅 {job.scheduled_date}</span>
                        <span>📍 {job.address}</span>
                        <span>₦{Number(job.hourly_rate).toLocaleString()}/hr</span>
                      </div>
                      {job.status === 'pending' && (
                        <button className={styles.cancelBtn} onClick={() => cancelJob(job.id)}>Cancel Request</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {history.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>History</h2>
                <div className={styles.jobGrid}>
                  {history.map(job => (
                    <div key={job.id} className={`${styles.jobCard} ${styles.jobCardDim}`}>
                      <div className={styles.jobTop}>
                        <div>
                          <p className={styles.jobArtisan}>{job.artisan_name}</p>
                          <p className={styles.jobCategory}>{job.category}</p>
                        </div>
                        <span className={`badge ${STATUS_COLORS[job.status]}`}>{job.status}</span>
                      </div>
                      <p className={styles.jobDesc}>{job.description}</p>
                      {job.status === 'completed' && !job.reviewed && (
                        <button className={styles.reviewBtn} onClick={() => setReviewJob(job)}>⭐ Leave Review</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {reviewJob && (
        <div className="modal-backdrop" onClick={() => setReviewJob(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Review {reviewJob.artisan_name}</h3>
              <button className="modal-close" onClick={() => setReviewJob(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="field">
                <label>Rating</label>
                <div className={styles.ratingPicker}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} className={`${styles.starBtn} ${review.rating >= n ? styles.starFilled : ''}`}
                      onClick={() => setReview(r => ({ ...r, rating: n }))}>★</button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Comment</label>
                <textarea placeholder="How was the job?" value={review.comment}
                  onChange={e => setReview(r => ({ ...r, comment: e.target.value }))} />
              </div>
              <button className="btn btn-navy" style={{ width: '100%', justifyContent: 'center' }} onClick={submitReview}>
                Submit Review →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
