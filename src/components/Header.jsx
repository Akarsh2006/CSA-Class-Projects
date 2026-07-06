'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Logo from '@/components/Logo';

export default function Header() {
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(data => { if (data && data.user) setUser(data.user); });
  }, []);

  useEffect(() => {
    const nav = document.querySelector('nav[data-topnav]');
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 20) nav.classList.add('shadow-md');
      else nav.classList.remove('shadow-md');
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav data-topnav="true" className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 transition-all duration-300 h-20">
      <div className="flex justify-between items-center h-full px-4 md:px-margin-x max-w-container-max mx-auto gap-2 md:gap-stack-lg">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 md:gap-stack-lg flex-1">
          <Link href="/" className="flex items-center gap-1.5 md:gap-2 text-lg sm:text-xl md:text-headline-md font-headline-md font-bold tracking-tight text-primary whitespace-nowrap">
            <Logo className="text-primary w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
            <span>BuildFolio</span>
          </Link>
        </div>

        <div className="flex items-center gap-1 md:gap-2 relative flex-shrink-0">
          <Link href="/dashboard" className="px-2.5 py-1.5 sm:px-5 sm:py-2.5 bg-primary text-on-primary text-xs sm:text-label-md font-label-md font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm flex items-center gap-1 whitespace-nowrap">
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">add</span>
            <span className="hidden sm:inline">Add Project</span>
            <span className="sm:hidden">New</span>
          </Link>

          {user ? (
            <div className="relative group ml-1 sm:ml-2" ref={profileRef}>
              <button
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/30 overflow-hidden"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[20px] sm:text-[24px]">person</span>
              </button>
              
              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low/50">
                  <p className="text-body-md font-semibold text-on-surface truncate">{user.name}</p>
                  <p className="text-label-sm text-on-surface-variant truncate">{user.email}</p>
                </div>
                <div className="p-2">
                  <button onClick={logout} className="block px-4 py-2 text-body-md text-error hover:bg-error-container hover:text-on-error-container rounded-lg transition-colors text-left w-full">
                    Log out
                  </button>
                </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Link href="/login" className="px-2 py-1.5 sm:px-5 sm:py-2.5 text-xs sm:text-label-md font-label-md font-semibold text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container-low rounded-xl whitespace-nowrap">
                Log in
              </Link>
              <Link href="/register" className="px-2.5 py-1.5 sm:px-5 sm:py-2.5 bg-surface-container-high text-on-surface text-xs sm:text-label-md font-label-md font-semibold rounded-xl hover:bg-surface-container transition-all shadow-sm border border-outline-variant/30 whitespace-nowrap">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
