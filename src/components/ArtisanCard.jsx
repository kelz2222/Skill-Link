import { Link } from 'react-router-dom'
import styles from './ArtisanCard.module.css'

const CATEGORY_ICONS = {
  Electrician: '⚡', Plumber: '🔧', Carpenter: '🪚', Painter: '🖌️',
  Welder: '🔥', 'AC Technician': '❄️', 'Generator Repair': '⚙️',
  Tiler: '🏗️', Mason: '🧱', Other: '🛠️'
}

function Stars({ rating }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star ${i <= Math.round(rating) ? 'filled' : ''}`}>★</span>
      ))}
    </div>
  )
}

export default function ArtisanCard({ artisan }) {
  const icon = CATEGORY_ICONS[artisan.category] || '🛠️'
  return (
    <Link to={`/artisan/${artisan.id}`} className={styles.card}>
      <div className={styles.avatar}>
        {artisan.avatar_url
          ? <img src={artisan.avatar_url} alt={artisan.full_name} />
          : <div className={styles.avatarFallback}>{artisan.full_name?.[0] || '?'}</div>
        }
        <div className={styles.categoryBadge}>{icon}</div>
      </div>
      <div className={styles.info}>
        <p className={styles.name}>{artisan.full_name}</p>
        <p className={styles.category}>{artisan.category}</p>
        <div className={styles.meta}>
          <Stars rating={artisan.avg_rating || 0} />
          <span className={styles.reviews}>({artisan.review_count || 0})</span>
        </div>
        <div className={styles.footer}>
          <span className={styles.rate}>₦{Number(artisan.hourly_rate || 0).toLocaleString()}/hr</span>
          <span className={`badge ${artisan.is_available ? 'badge-green' : 'badge-yellow'}`}>
            {artisan.is_available ? 'Available' : 'Busy'}
          </span>
        </div>
      </div>
    </Link>
  )
}

export { Stars, CATEGORY_ICONS }
