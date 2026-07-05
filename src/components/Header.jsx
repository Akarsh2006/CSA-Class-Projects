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
      <div className="flex justify-between items-center h-full px-margin-x max-w-container-max mx-auto gap-stack-lg">
        {/* Left: Logo + search */}
        <div className="flex items-center gap-stack-lg flex-1">
          <Link href="/" className="flex items-center gap-2 text-headline-md font-headline-md font-bold tracking-tight text-primary whitespace-nowrap">
            <Logo className="text-primary" />
            BuildFolio
          </Link>
        </div>

        <div className="flex items-center gap-stack-sm relative">
          <Link href="/dashboard" className="px-5 py-2.5 bg-primary text-on-primary text-label-md font-label-md font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">add</span>Add Project
          </Link>

          {user ? (
            <div className="relative group ml-2" ref={profileRef}>
              <button
                className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/30 overflow-hidden"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[24px]">person</span>
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
            <>
              <Link href="/login" className="px-5 py-2.5 text-label-md font-label-md font-semibold text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container-low rounded-xl">
                Log in
              </Link>
              <Link href="/register" className="px-5 py-2.5 bg-surface-container-high text-on-surface text-label-md font-label-md font-semibold rounded-xl hover:bg-surface-container transition-all shadow-sm border border-outline-variant/30">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
