'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  
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

  const handleGetOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowOtpModal(true);
      } else {
        setError(data.error || 'Failed to send OTP.');
      }
    } catch { setError('Unexpected error. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }
    setOtpLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, otp: otpValue }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowOtpModal(false);
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch { setError('Unexpected error. Please try again.'); }
    finally { setOtpLoading(false); }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value !== '' && index < 5) {
      otpRefs[index + 1].current.focus();
    }
    
    // Auto-verify if all 6 digits are filled
    if (value !== '' && index === 5 && newOtp.every(d => d !== '')) {
      // Small delay to allow state to update before verifying
      setTimeout(() => {
         const btn = document.getElementById('verify-btn');
         if (btn) btn.click();
      }, 100);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  return (
    <div className="bg-surface-container-low min-h-screen flex flex-col">

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

            <form className="space-y-6" onSubmit={handleGetOtp}>
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
                    <span>Get OTP</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Toggle Link */}
            <div className="mt-stack-lg text-center border-t border-surface-container-high pt-stack-md">
              <p className="font-body-md text-on-surface-variant">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4 transition-all">
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
          <span className="font-label-md text-label-md text-on-surface-variant">BuildFolio</span>
          <p className="font-body-md text-body-md text-on-surface-variant opacity-70 mt-2">© 2024-28 CS-A. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6" />
      </footer>
    {/* OTP Modal */}
    {showOtpModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-highest/80 backdrop-blur-sm p-4">
        <div className="bg-surface-container-lowest rounded-3xl p-stack-xl max-w-md w-full shadow-2xl border border-primary/10 relative text-center">
          <button 
            onClick={() => setShowOtpModal(false)}
            className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
            <span className="material-symbols-outlined text-3xl">verified_user</span>
          </div>
          
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">Enter Code</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-8">
            OTP has sent to <span className="font-semibold text-primary">{email}</span>
          </p>

          <div className="flex justify-between gap-2 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={otpRefs[index]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-10 sm:w-12 h-12 sm:h-14 text-center font-headline-md text-headline-md bg-surface border border-outline-variant rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
              />
            ))}
          </div>

          {error && (
            <p className="text-error text-body-sm mb-4">{error}</p>
          )}

          <button
            id="verify-btn"
            onClick={handleVerifyOtp}
            disabled={otpLoading || otp.some(d => d === '')}
            className="w-full bg-primary text-on-primary font-headline-sm py-4 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center h-14"
          >
            {otpLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Verify Email'
            )}
          </button>
        </div>
      </div>
    )}

    </div>
  );
}
