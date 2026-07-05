'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage(data.message || 'If that email address is in our database, we will send you an email to reset your password.');
        setEmail(''); // clear input
      } else {
        setError(data.error || 'Failed to request password reset.');
      }
    } catch {
      setError('Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Reset Password</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Enter your email to receive a reset link</p>
          </div>

          {error && (
            <div className="mb-stack-md p-3 rounded-xl bg-error-container text-on-error-container text-body-md font-body-md">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-stack-md p-4 rounded-xl bg-secondary-container/20 border border-secondary-container/30 text-on-surface text-body-md font-body-md text-center">
              {message}
            </div>
          )}

          {/* Form */}
          {!message && (
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

              {/* Submit */}
              <button
                className="w-full bg-primary text-on-primary font-headline-md text-headline-md py-4 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shadow-lg shadow-primary/5"
                type="submit"
                disabled={loading || !email}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <span className="material-symbols-outlined">mail</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Back to Login link */}
          <div className="mt-stack-lg text-center border-t border-surface-container-high pt-stack-md">
            <p className="font-body-md text-on-surface-variant">
              Remember your password?{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4 transition-all">
                Log in
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
