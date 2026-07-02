'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);
  const router = useRouter();

  // 3D mouse parallax effect
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const onMouseMove = (e) => {
      const xAxis = (window.innerWidth / 2 - e.pageX) / 100;
      const yAxis = (window.innerHeight / 2 - e.pageY) / 100;
      card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    };
    document.addEventListener('mousemove', onMouseMove);
    return () => document.removeEventListener('mousemove', onMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Registration failed. Please try again.');
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
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Registration Card with 3D effect */}
          <div
            ref={cardRef}
            className="glass-card"
            style={{ padding: '32px', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', transition: 'transform 0.1s ease' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 className="font-headline-lg" style={{ color: 'var(--primary)', marginBottom: '8px' }}>Create Account</h1>
            </div>

            {error && <div className="alert-error">{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Full Name */}
              <div>
                <label className="form-label" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Full Name</label>
                <div className="form-input-icon" style={{ marginTop: '4px' }}>
                  <span className="material-symbols-outlined icon">person</span>
                  <input type="text" required className="form-input" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} style={{ paddingLeft: '42px' }} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="form-label" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email</label>
                <div className="form-input-icon" style={{ marginTop: '4px' }}>
                  <span className="material-symbols-outlined icon">mail</span>
                  <input type="email" required className="form-input" placeholder="student@university.edu" value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft: '42px' }} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="form-label" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
                <div className="form-input-icon" style={{ marginTop: '4px' }}>
                  <span className="material-symbols-outlined icon">lock</span>
                  <input type={showPw ? 'text' : 'password'} required className="form-input" placeholder="••••••••" minLength={6} value={password} onChange={e => setPassword(e.target.value)} style={{ paddingLeft: '42px', paddingRight: '48px' }} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--outline-variant)', cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{showPw ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
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
                  transition: 'opacity 0.2s, transform 0.15s',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? <span className="loading-spinner" style={{ borderTopColor: '#fff' }} /> : (
                  <>
                    <span>Register</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Toggle link */}
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(198,198,205,0.3)', textAlign: 'center' }}>
              <p className="font-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: 'var(--secondary)', fontFamily: 'var(--font-headline)', fontWeight: 600, fontSize: '24px' }}>Log In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ padding: '24px 32px', borderTop: '1px solid var(--surface-container-highest)', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', background: 'var(--surface)' }}>
        <span className="font-label-md" style={{ color: 'var(--on-surface-variant)' }}>ProjectHub</span>
        <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', opacity: 0.7 }}>© 2024-28 CS-A. All rights reserved.</p>
      </footer>
    </main>
  );
}
