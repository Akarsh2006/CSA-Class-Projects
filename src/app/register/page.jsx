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

  // 3D parallax effect (exact Stitch JS)
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const onMove = (e) => {
      const xAxis = (window.innerWidth / 2 - e.pageX) / 100;
      const yAxis = (window.innerHeight / 2 - e.pageY) / 100;
      card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    };
    document.addEventListener('mousemove', onMove);
    return () => document.removeEventListener('mousemove', onMove);
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
    <div className="bg-surface-container-low min-h-screen flex flex-col">

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-x h-20 max-w-container-max mx-auto bg-surface/80 backdrop-blur-md">
        <div className="flex items-center gap-stack-md">
          <Link href="/" className="font-headline-md text-headline-md font-bold text-primary">ProjectHub</Link>
        </div>
        <nav className="hidden md:flex items-center space-x-8" />
        <div className="flex items-center" />
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center pt-24 pb-stack-xl px-margin-x">
        <div className="w-full max-w-md">
          {/* Registration Card — glass with 3D tilt */}
          <div
            ref={cardRef}
            className="glass-card p-8 rounded-xl shadow-sm"
            style={{ transition: 'transform 0.1s ease' }}
          >
            <div className="mb-stack-lg text-center">
              <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Create Account</h1>
            </div>

            {error && (
              <div className="mb-stack-md p-3 rounded-xl bg-error-container text-on-error-container text-body-md">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="space-y-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block ml-1" htmlFor="full_name">
                  Full Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">person</span>
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-xl font-body-md text-body-md input-focus transition-all duration-200"
                    id="full_name" name="full_name" type="text" required
                    placeholder="John Doe"
                    value={name} onChange={e => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block ml-1" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">mail</span>
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-xl font-body-md text-body-md input-focus transition-all duration-200"
                    id="email" name="email" type="email" required
                    placeholder="student@university.edu"
                    value={email} onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block ml-1" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">lock</span>
                  <input
                    className="w-full pl-10 pr-10 py-3 bg-white border border-outline-variant rounded-xl font-body-md text-body-md input-focus transition-all duration-200"
                    id="password" name="password"
                    type={showPw ? 'text' : 'password'} required minLength={6}
                    placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors"
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                  >
                    <span className="material-symbols-outlined text-body-md">{showPw ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Register Button */}
              <button
                className="w-full bg-primary text-on-primary font-headline-md text-headline-md py-4 rounded-xl transition-all hover:shadow-lg hover:opacity-90 active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Register</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Toggle Link */}
            <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Already have an account?{' '}
                <Link href="/login" className="text-secondary font-headline-md text-headline-md hover:underline transition-all">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-stack-lg px-margin-x flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto bg-surface border-t border-surface-container-highest">
        <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
          <span className="font-label-md text-label-md text-on-surface-variant">ProjectHub</span>
          <p className="font-body-md text-body-md text-on-surface-variant opacity-70 mt-2">© 2024-28 CS-A. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6" />
      </footer>
    </div>
  );
}
