'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid email or password.');
      }
    } catch { setError('Unexpected error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <main style={{ background: 'var(--surface-container-low)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Minimal header */}
      <header className="topnav" style={{ position: 'fixed' }}>
        <div className="topnav-inner">
          <Link href="/" className="topnav-logo">ProjectHub</Link>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '96px', paddingBottom: '64px', padding: '96px 32px 64px' }}>
        {/* Login Card */}
        <div style={{
          width: '100%', maxWidth: '440px',
          background: 'var(--surface-container-lowest)',
          borderRadius: '12px', padding: '32px',
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 className="font-headline-lg" style={{ color: 'var(--primary)', marginBottom: '8px' }}>Log In</h1>
            <p className="font-body-md" style={{ color: 'var(--on-surface-variant)' }}>Welcome back to ProjectHub</p>
          </div>

          {error && <div className="alert-error">{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Email */}
            <div>
              <label className="form-label" htmlFor="email">EMAIL ADDRESS</label>
              <input
                id="email" type="email" required
                className="form-input"
                placeholder="name@university.edu"
                value={email} onChange={e => setEmail(e.target.value)}
                style={{ marginTop: '4px' }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="form-label" htmlFor="password">PASSWORD</label>
              <div className="form-input-icon" style={{ marginTop: '4px' }}>
                <input
                  id="password" type={showPw ? 'text' : 'password'} required
                  className="form-input"
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', marginTop: '4px' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{showPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="remember" style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }} />
              <label htmlFor="remember" className="font-body-md" style={{ color: 'var(--on-surface-variant)', cursor: 'pointer' }}>Remember me</label>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '16px', marginTop: '4px',
                background: 'var(--primary)', color: 'var(--on-primary)',
                border: 'none', borderRadius: '12px', cursor: 'pointer',
                fontFamily: 'var(--font-headline)', fontSize: '24px', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                transition: 'opacity 0.2s, transform 0.15s',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? <span className="loading-spinner" style={{ borderTopColor: '#fff' }} /> : (
                <>
                  <span>Log In</span>
                  <span className="material-symbols-outlined">login</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle link */}
          <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid var(--surface-container-high)', paddingTop: '16px' }}>
            <p className="font-body-md" style={{ color: 'var(--on-surface-variant)' }}>
              Don't have an account?{' '}
              <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}>Register</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ padding: '24px 32px', borderTop: '1px solid var(--surface-container-high)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', maxWidth: 'var(--container-max)', margin: '0 auto', width: '100%' }}>
        <span className="font-label-md" style={{ color: 'var(--on-surface-variant)' }}>© 2024-28 CS-A. All rights reserved.</span>
        <a href="#" className="font-body-md" style={{ color: 'var(--on-surface-variant)' }}>Contact Support</a>
      </footer>
    </main>
  );
}
