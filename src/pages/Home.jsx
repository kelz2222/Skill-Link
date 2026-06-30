import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import ArtisanCard, { CATEGORY_ICONS } from '../components/ArtisanCard.jsx'
import styles from './Home.module.css'

const CATEGORIES = ['Electrician','Plumber','Carpenter','Painter','Welder','AC Technician','Generator Repair','Tiler','Mason']

const HOW_IT_WORKS = [
  { icon: '🔍', title: 'Search', desc: 'Browse artisans by skill category. Filter by availability and rating.' },
  { icon: '📋', title: 'Book', desc: 'Choose your artisan, describe the job, pick a date. All handled in the app.' },
  { icon: '💳', title: 'Pay Securely', desc: 'Pay through Paystack. Funds are held safely until the job is complete.' },
  { icon: '⭐', title: 'Review', desc: 'Rate your artisan after the job. Help others find the best in Umuahia.' },
]

export default function Home() {
  const [search, setSearch] = useState('')
  const [featured, setFeatured] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    supabase.from('artisans')
      .select('*')
      .eq('is_verified', true)
      .eq('is_available', true)
      .order('avg_rating', { ascending: false })
      .limit(6)
      .then(({ data }) => setFeatured(data || []))
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    navigate(`/browse?q=${search}`)
  }

  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>🇳🇬 Umuahia, Abia State</p>
          <h1 className={styles.headline}>
            Find Skilled<br />
            <span className={styles.accent}>Artisans</span><br />
            Near You
          </h1>
          <p className={styles.sub}>
            Electricians, plumbers, carpenters and more — verified, rated, and ready to work. Book in minutes, pay securely.
          </p>
          <form className={styles.searchBox} onSubmit={handleSearch}>
            <input
              placeholder="What do you need? e.g. electrician, plumber..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-bronze">Search</button>
          </form>
          <div className={styles.heroStats}>
            <div className={styles.stat}><span className={styles.statNum}>200+</span><span className={styles.statLabel}>Verified Artisans</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><span className={styles.statNum}>1,400+</span><span className={styles.statLabel}>Jobs Completed</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><span className={styles.statNum}>4.8★</span><span className={styles.statLabel}>Average Rating</span></div>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroCard}>
            <div className={styles.heroCardAvatar}>E</div>
            <div>
              <p className={styles.heroCardName}>Emeka Okafor</p>
              <p className={styles.heroCardRole}>⚡ Electrician</p>
              <p className={styles.heroCardRating}>★★★★★ 4.9 · 87 jobs</p>
            </div>
          </div>
          <div className={`${styles.heroCard} ${styles.heroCard2}`}>
            <div className={`${styles.heroCardAvatar} ${styles.bronze}`}>C</div>
            <div>
              <p className={styles.heroCardName}>Chioma Eze</p>
              <p className={styles.heroCardRole}>🔧 Plumber</p>
              <p className={styles.heroCardRating}>★★★★★ 4.7 · 63 jobs</p>
            </div>
          </div>
          <div className={`${styles.heroCard} ${styles.heroCard3}`}>
            <div className={`${styles.heroCardAvatar} ${styles.green}`}>A</div>
            <div>
              <p className={styles.heroCardName}>Amaka Nwosu</p>
              <p className={styles.heroCardRole}>🪚 Carpenter</p>
              <p className={styles.heroCardRating}>★★★★☆ 4.5 · 41 jobs</p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.categories} section`}>
        <p className={styles.sectionEye}>Browse by Trade</p>
        <h2 className="section-title">Every Skill You Need</h2>
        <div className={styles.catGrid}>
          {CATEGORIES.map(cat => (
            <Link key={cat} to={`/browse?category=${cat}`} className={styles.catCard}>
              <span className={styles.catIcon}>{CATEGORY_ICONS[cat]}</span>
              <span className={styles.catName}>{cat}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.howSection}>
        <div className="section">
          <p className={styles.sectionEye} style={{ color: 'rgba(255,255,255,0.6)' }}>Simple Process</p>
          <h2 className="section-title" style={{ color: 'white' }}>How Skill Link Works</h2>
          <div className={styles.howGrid}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className={styles.howCard}>
                <div className={styles.howIcon}>{step.icon}</div>
                <div className={styles.howStep}>0{i + 1}</div>
                <h3 className={styles.howTitle}>{step.title}</h3>
                <p className={styles.howDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="section">
          <p className={styles.sectionEye}>Top Rated</p>
          <h2 className="section-title">Featured Artisans</h2>
          <p className="section-sub" style={{ marginBottom: 32 }}>Highly rated professionals trusted by Umuahia residents.</p>
          <div className={styles.artisanGrid}>
            {featured.map(a => <ArtisanCard key={a.id} artisan={a} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/browse" className="btn btn-navy">View All Artisans →</Link>
          </div>
        </section>
      )}

      <section className={styles.ctaBanner}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Are You a Skilled Artisan?</h2>
          <p className={styles.ctaSub}>Join Skill Link, get discovered by customers in Umuahia, and grow your income. Free to join.</p>
          <Link to="/register" className="btn btn-bronze">Join as Artisan →</Link>
        </div>
      </section>
    </main>
  )
}
