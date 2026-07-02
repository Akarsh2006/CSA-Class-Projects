'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(data => { if (data) setUser(data); });
  }, []);

  useEffect(() => {
    const nav = document.getElementById('main-topnav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="topnav" id="main-topnav">
      <div className="topnav-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flex: 1 }}>
          <Link href="/" className="topnav-logo">ProjectHub</Link>
        </div>

        <div className="topnav-actions">
          {user ? (
            <>
              <span className="font-body-md" style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>
                Hi, {user.name}
              </span>
              <Link href="/dashboard" className="btn-secondary">Dashboard</Link>
              <button onClick={logout} className="btn-primary">Log out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary">Log in</Link>
              <Link href="/register" className="btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
