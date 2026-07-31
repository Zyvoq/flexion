import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { isAuthenticated, profile, user, signOut } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="navbar__brand">
          <span className="navbar__brand-icon" />
          <span>Flexion</span>
        </Link>

        {/* Status indicator motif */}
        <div className="readout-tag readout-tag--signal" style={{ display: 'none' }}>
          <span>SYS: ONLINE</span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="navbar__links">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`navbar__link ${isActive('/dashboard') ? 'navbar__link--active' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                to="/workout"
                className={`navbar__link ${isActive('/workout') ? 'navbar__link--active' : ''}`}
              >
                Workout
              </Link>
              <Link
                to="/exercises"
                className={`navbar__link ${isActive('/exercises') ? 'navbar__link--active' : ''}`}
              >
                Library
              </Link>
              <Link
                to="/history"
                className={`navbar__link ${isActive('/history') ? 'navbar__link--active' : ''}`}
              >
                History
              </Link>
              <Link
                to="/leaderboard"
                className={`navbar__link ${isActive('/leaderboard') ? 'navbar__link--active' : ''}`}
              >
                Leaderboard
              </Link>
              <Link
                to="/profile"
                className={`navbar__link ${isActive('/profile') ? 'navbar__link--active' : ''}`}
              >
                <span className="font-mono">{profile?.display_name || user?.email?.split('@')[0] || 'Profile'}</span>
              </Link>
              <button
                type="button"
                className="btn-secondary"
                onClick={signOut}
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/how-it-works"
                className={`navbar__link ${isActive('/how-it-works') ? 'navbar__link--active' : ''}`}
              >
                How It Works
              </Link>
              <Link
                to="/exercises"
                className={`navbar__link ${isActive('/exercises') ? 'navbar__link--active' : ''}`}
              >
                Exercises
              </Link>
              <Link
                to="/login"
                className={`navbar__link ${isActive('/login') ? 'navbar__link--active' : ''}`}
              >
                Log In
              </Link>
              <Link to="/signup" className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
                Get Started
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ display: 'none', padding: '0.4rem 0.7rem' }}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>
    </header>
  )
}
