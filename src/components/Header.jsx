'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={`${styles.header} glass`}>
      <div className="container">
        <div className={styles.navContainer}>
          <Link href="/" className={styles.logo}>
            <span className="gradient-text">CSA Projects</span>
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.desktopNav}>
            {user ? (
              <div className={styles.authLinks}>
                <span className={styles.greeting}>Hi, {user.name}</span>
                <Link href="/dashboard" className="btn-secondary">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="btn-secondary">
                  Logout
                </button>
              </div>
            ) : (
              <div className={styles.authLinks}>
                <Link href="/login" className="btn-secondary">
                  Login
                </Link>
                <Link href="/register" className="btn-primary">
                  Register
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button className={styles.menuBtn} onClick={toggleMenu} aria-label="Toggle Menu">
            <span className={`${styles.bar} ${isMenuOpen ? styles.open : ''}`}></span>
            <span className={`${styles.bar} ${isMenuOpen ? styles.open : ''}`}></span>
            <span className={`${styles.bar} ${isMenuOpen ? styles.open : ''}`}></span>
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <nav className={styles.mobileNav}>
            {user ? (
              <div className={styles.mobileAuthLinks}>
                <span className={styles.greeting}>Hi, {user.name}</span>
                <Link href="/dashboard" className="btn-secondary" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="btn-secondary">
                  Logout
                </button>
              </div>
            ) : (
              <div className={styles.mobileAuthLinks}>
                <Link href="/login" className="btn-secondary" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className="btn-primary" onClick={() => setIsMenuOpen(false)}>
                  Register
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
