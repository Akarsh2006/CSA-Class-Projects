'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

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
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid email or password.');
      }
    } catch { setError('Unexpected error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-surface-container-low min-h-screen flex flex-col font-body-md text-on-surface selection:bg-primary/10 selection:text-primary">

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-md transition-all duration-300 h-20 border-b border-surface-container-high">
        <div className="flex justify-between items-center h-full px-margin-x max-w-container-max mx-auto">
          <Link href="/" className="flex items-center gap-2 font-headline-md text-headline-md font-bold text-primary">
            <Logo className="text-primary" />
            BuildFolio
          </Link>
          <nav className="hidden md:flex items-center space-x-gutter" />
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center pt-24 pb-stack-xl px-margin-x">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-xl p-stack-lg border border-primary/5 transition-all duration-500">

          {/* Header */}
          <div className="text-center mb-stack-lg">
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Log In</h1>
          </div>

          {error && (
            <div className="mb-stack-md p-3 rounded-xl bg-error-container text-on-error-container text-body-md font-body-md">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-stack-md" onSubmit={handleSubmit}>

            {/* Email */}
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant block ml-1" htmlFor="email">
                EMAIL ADDRESS
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-bright font-body-md text-on-surface input-academic transition-all"
                id="email" type="email" required
                placeholder="name@university.edu"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant block ml-1" htmlFor="password">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-bright font-body-md text-on-surface input-academic transition-all"
                  id="password" type={showPw ? 'text' : 'password'} required
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                >
                  <span className="material-symbols-outlined text-[20px]">{showPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <Link href="/forgot-password" className="font-label-sm text-label-sm text-primary hover:underline transition-all mr-1">
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button
              className="w-full bg-primary text-on-primary font-headline-md text-headline-md py-4 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shadow-lg shadow-primary/5"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Log In</span>
                  <span className="material-symbols-outlined">login</span>
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <div className="mt-stack-lg text-center border-t border-surface-container-high pt-stack-md">
            <p className="font-body-md text-on-surface-variant">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4 transition-all">
                Register
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface border-t border-surface-container-high">
        <div className="py-stack-lg px-margin-x max-w-container-max mx-auto flex flex-col items-center md:items-start">
          <div className="font-label-md text-label-md text-on-surface-variant">© 2024-28 CS-A. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
