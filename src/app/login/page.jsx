'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
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
    <div className="bg-surface-container-low min-h-screen flex flex-col font-body-md text-on-surface selection:bg-primary/10 selection:text-primary">

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-x h-20 max-w-container-max mx-auto bg-surface/80 backdrop-blur-md transition-all duration-300">
        <Link href="/" className="font-headline-md text-headline-md font-bold text-primary">ProjectHub</Link>
        <nav className="hidden md:flex items-center space-x-gutter" />
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center pt-24 pb-stack-xl px-margin-x">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-xl p-stack-lg border border-primary/5 transition-all duration-500">

          {/* Header */}
          <div className="text-center mb-stack-lg">
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Log In</h1>
            <p className="font-body-md text-on-surface-variant">Welcome back to ProjectHub</p>
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
              <div className="flex justify-between items-center">
                <label className="font-label-sm text-label-sm text-on-surface-variant block ml-1" htmlFor="password">
                  PASSWORD
                </label>
              </div>
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
            </div>

            {/* Remember me */}
            <div className="flex items-center space-x-2 py-1">
              <input
                className="w-4 h-4 rounded-md border-outline-variant text-primary focus:ring-primary/20 cursor-pointer"
                id="remember" type="checkbox"
                checked={remember} onChange={e => setRemember(e.target.checked)}
              />
              <label className="font-body-md text-on-surface-variant cursor-pointer select-none" htmlFor="remember">
                Remember me
              </label>
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
      <footer className="w-full py-stack-lg px-margin-x flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto bg-surface border-t border-surface-container-high">
        <div className="font-label-md text-label-md text-on-surface-variant mb-4 md:mb-0">© 2024-28 CS-A. All rights reserved.</div>
        <div className="flex space-x-gutter">
          <Link href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-all duration-200">Contact Support</Link>
        </div>
      </footer>
    </div>
  );
}
