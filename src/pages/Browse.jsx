import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import ArtisanCard, { CATEGORY_ICONS } from '../components/ArtisanCard.jsx'
import styles from './Browse.module.css'

const CATEGORIES = ['All','Electrician','Plumber','Carpenter','Painter','Welder','AC Technician','Generator Repair','Tiler','Mason']

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [artisans, setArtisans] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [availableOnly, setAvailableOnly] = useState(false)

  useEffect(() => { fetchArtisans() }, [category, availableOnly])

  async function fetchArtisans() {
    setLoading(true)
    let query = supabase.from('artisans').select('*').eq('is_verified', true).order('avg_rating', { ascending: false })
    if (category !== 'All') query = query.eq('category', category)
    if (availableOnly) query = query.eq('is_available', true)
    const { data } = await query
    setArtisans(data || [])
    setLoading(false)
  }

  const filtered = artisans.filter(a =>
    !search || a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.category?.toLowerCase().includes(search.toLowerCase()) ||
    a.bio?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Find Artisans</h1>
        <p className={styles.sub}>Verified professionals in Umuahia, ready to work</p>
        <input
          className={styles.searchInput}
          placeholder="Search by name, skill, or keyword..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <p className={styles.filterHead}>Category</p>
          {CATEGORIES.map(cat => (
            <button key={cat} className={`${styles.filterBtn} ${category === cat ? styles.filterActive : ''}`}
              onClick={() => setCategory(cat)}>
              {cat !== 'All' && <span>{CATEGORY_ICONS[cat]}</span>}
              {cat}
            </button>
          ))}
          <div className="divider" style={{ margin: '16px 0' }} />
          <label className={styles.toggle}>
            <input type="checkbox" checked={availableOnly} onChange={e => setAvailableOnly(e.target.checked)} />
            <span>Available now only</span>
          </label>
        </aside>

        <div className={styles.results}>
          <p className={styles.resultCount}>
            {loading ? 'Loading...' : `${filtered.length} artisan${filtered.length !== 1 ? 's' : ''} found`}
          </p>
          {loading ? (
            <div className={styles.loadingGrid}>
              {[1,2,3,4,5,6].map(i => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <p style={{ fontSize: 40 }}>🔍</p>
              <p>No artisans found. Try a different search.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filtered.map(a => <ArtisanCard key={a.id} artisan={a} />)}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
