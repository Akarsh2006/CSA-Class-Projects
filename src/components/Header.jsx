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
    const nav = document.querySelector('nav[data-topnav]');
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 20) nav.classList.add('shadow-md');
      else nav.classList.remove('shadow-md');
    };
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
    <nav data-topnav="true" className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 transition-all duration-300 h-20">
      <div className="flex justify-between items-center h-full px-margin-x max-w-container-max mx-auto gap-stack-lg">
        {/* Left: Logo + search */}
        <div className="flex items-center gap-stack-lg flex-1">
          <Link href="/" className="text-headline-md font-headline-md font-bold tracking-tight text-primary whitespace-nowrap">
            ProjectHub
          </Link>
        </div>

        {/* Right: auth buttons */}
        <div className="flex items-center gap-stack-sm">
          {user ? (
            <>
              <span className="text-label-md font-label-md text-on-surface-variant hidden sm:block">Hi, {user.name}</span>
              <Link href="/dashboard" className="px-5 py-2.5 text-label-md font-label-md font-semibold text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container-low rounded-xl">
                Dashboard
              </Link>
              <button onClick={logout} className="px-5 py-2.5 bg-primary text-on-primary text-label-md font-label-md font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="px-5 py-2.5 bg-primary text-on-primary text-label-md font-label-md font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">add</span>Add Project
              </Link>
              <Link href="/login" className="px-5 py-2.5 text-label-md font-label-md font-semibold text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container-low rounded-xl">
                Log in
              </Link>
              <Link href="/register" className="px-5 py-2.5 bg-primary text-on-primary text-label-md font-label-md font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
