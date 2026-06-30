import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { Stars, CATEGORY_ICONS } from '../components/ArtisanCard.jsx'
import styles from './ArtisanProfile.module.css'

export default function ArtisanProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [artisan, setArtisan] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBooking, setShowBooking] = useState(false)
  const [user, setUser] = useState(null)
  const [booking, setBooking] = useState({ description: '', date: '', address: '' })
  const [submitting, setSubmitting] = useState(false)
  const [booked, setBooked] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null))
    Promise.all([
      supabase.from('artisans').select('*').eq('id', id).single(),
      supabase.from('reviews').select('*').eq('artisan_id', id).order('created_at', { ascending: false })
    ]).then(([aRes, rRes]) => {
      setArtisan(aRes.data)
      setReviews(rRes.data || [])
      setLoading(false)
    })
  }, [id])

  async function handleBook() {
    if (!user) { navigate('/login'); return }
    setSubmitting(true)
    const { error } = await supabase.from('jobs').insert([{
      customer_id: user.id,
      artisan_id: artisan.id,
      artisan_name: artisan.full_name,
      customer_name: user.user_metadata?.full_name || 'Customer',
      category: artisan.category,
      description: booking.description,
      scheduled_date: booking.date,
      address: booking.address,
      hourly_rate: artisan.hourly_rate,
      commission_rate: 0.10,
      status: 'pending',
    }])
    setSubmitting(false)
    if (!error) { setBooked(true); setShowBooking(false) }
    else alert('Booking failed. Try again.')
  }

  if (loading) return <div className={styles.loading}>Loading artisan profile...</div>
  if (!artisan) return <div className={styles.loading}>Artisan not found.</div>

  const icon = CATEGORY_ICONS[artisan.category] || '🛠️'

  return (
    <main className={styles.main}>
      {booked && (
        <div className={styles.successBanner}>
          ✅ Booking sent! The artisan will confirm shortly. Check your dashboard for updates.
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.profileCard}>
          <div className={styles.avatar}>
            {artisan.avatar_url
              ? <img src={artisan.avatar_url} alt={artisan.full_name} />
              : <div className={styles.avatarFallback}>{artisan.full_name?.[0]}</div>
            }
          </div>
          <div className={styles.profileInfo}>
            <div className={styles.nameRow}>
              <h1 className={styles.name}>{artisan.full_name}</h1>
              {artisan.is_verified && <span className="badge badge-navy">✓ Verified</span>}
            </div>
            <p className={styles.category}>{icon} {artisan.category}</p>
            <div className={styles.ratingRow}>
              <Stars rating={artisan.avg_rating || 0} />
              <span className={styles.ratingNum}>{(artisan.avg_rating || 0).toFixed(1)}</span>
              <span className={styles.reviewCount}>({artisan.review_count || 0} reviews)</span>
            </div>
            <p className={styles.location}>📍 {artisan.location || 'Umuahia, Abia State'}</p>
            <p className={styles.rate}>₦{Number(artisan.hourly_rate || 0).toLocaleString()} / hour</p>
            <span className={`badge ${artisan.is_available ? 'badge-green' : 'badge-yellow'}`}>
              {artisan.is_available ? '● Available Now' : '● Currently Busy'}
            </span>
          </div>

          <div className={styles.bookBox}>
            <p className={styles.bookRate}>₦{Number(artisan.hourly_rate || 0).toLocaleString()}<span>/hr</span></p>
            <p className={styles.bookNote}>10% platform commission applies</p>
            <button className="btn btn-bronze" style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setShowBooking(true)} disabled={!artisan.is_available}>
              {artisan.is_available ? 'Book Now →' : 'Currently Unavailable'}
            </button>
            <button className={styles.callBtn} onClick={() => window.open(`tel:${artisan.phone}`)}>
              📞 Call Artisan
            </button>
          </div>
        </div>

        <div className={`card ${styles.section}`}>
          <h2 className={styles.sectionTitle}>About {artisan.full_name}</h2>
          <p className={styles.bio}>{artisan.bio || 'No bio provided yet.'}</p>
          <div className={styles.skills}>
            {artisan.skills?.map(skill => (
              <span key={skill} className={`badge badge-navy`}>{skill}</span>
            ))}
          </div>
        </div>

        <div className={`card ${styles.section}`}>
          <h2 className={styles.sectionTitle}>Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>No reviews yet. Be the first!</p>
          ) : (
            <div className={styles.reviewList}>
              {reviews.map(r => (
                <div key={r.id} className={styles.review}>
                  <div className={styles.reviewTop}>
                    <div className={styles.reviewAvatar}>{r.customer_name?.[0] || 'C'}</div>
                    <div>
                      <p className={styles.reviewName}>{r.customer_name}</p>
                      <Stars rating={r.rating} />
                    </div>
                    <span className={styles.reviewDate}>{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className={styles.reviewText}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showBooking && (
        <div className="modal-backdrop" onClick={() => setShowBooking(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Book {artisan.full_name}</h3>
              <button className="modal-close" onClick={() => setShowBooking(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className={styles.bookSummary}>
                <span>{icon} {artisan.category}</span>
                <span>₦{Number(artisan.hourly_rate).toLocaleString()}/hr</span>
              </div>
              <div className="field">
                <label>Describe the job *</label>
                <textarea placeholder="What needs to be done? Be as detailed as possible..."
                  value={booking.description} onChange={e => setBooking({ ...booking, description: e.target.value })} />
              </div>
              <div className="field">
                <label>Preferred Date *</label>
                <input type="date" value={booking.date} onChange={e => setBooking({ ...booking, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="field">
                <label>Your Address *</label>
                <input placeholder="Where should the artisan come?" value={booking.address}
                  onChange={e => setBooking({ ...booking, address: e.target.value })} />
              </div>
              <div className={styles.bookNote2}>
                💳 Payment is collected via Paystack after the job is confirmed. 10% goes to Skill Link.
              </div>
              <button className="btn btn-bronze" style={{ width: '100%', justifyContent: 'center' }}
                disabled={!booking.description || !booking.date || !booking.address || submitting}
                onClick={handleBook}>
                {submitting ? 'Sending Request...' : 'Confirm Booking Request →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
