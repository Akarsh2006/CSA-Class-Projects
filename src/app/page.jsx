'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';
import DotField from '@/components/DotField';
import RotatingText from '@/components/RotatingText';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [filterOption, setFilterOption] = useState('Recent');
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then(r => r.ok ? r.json() : []),
      fetch('/api/auth/me').then(r => r.ok ? r.json() : null),
    ]).then(([projectsData, userData]) => {
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      if (userData && userData.user) setUser(userData.user);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  let filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.studentName.toLowerCase().includes(search.toLowerCase())
  );

  filtered.sort((a, b) => {
    if (filterOption === 'Most liked') {
      return (b.likes?.length || 0) - (a.likes?.length || 0);
    } else if (filterOption === 'Oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* TopNavBar */}
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative pt-stack-xl pb-stack-lg px-margin-x min-h-[450px] flex items-center justify-center">
          <div className="absolute inset-0 z-0 overflow-hidden" style={{ maskImage: 'linear-gradient(to bottom, white 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, white 60%, transparent 100%)' }}>
            <DotField
              dotRadius={1.5}
              dotSpacing={14}
              bulgeStrength={67}
              glowRadius={150}
              sparkle={true}
              waveAmplitude={0}
              gradientFrom="rgba(0, 0, 0, 0.6)"
              gradientTo="rgba(0, 0, 0, 0.45)"
              glowColor="rgba(0, 0, 0, 0.04)"
            />
          </div>
          <div className="relative z-10 w-full max-w-container-max mx-auto text-center space-y-stack-md">
            <h1 className="text-display font-display tracking-tight text-on-surface mb-stack-sm pointer-events-none">
              2024-28
              <div>
                &nbsp;<span className="text-secondary">CS-A</span>
              </div>
              <div className="flex flex-col md:flex-row justify-center items-center w-full mt-1 sm:mt-2 gap-y-1 md:gap-y-0">
                <div className="w-full md:w-1/2 text-center md:text-right">Student<span className="hidden md:inline">&nbsp;</span></div>
                <div className="w-full md:w-1/2 text-center md:text-left">
                  <RotatingText
                    texts={['Projects', 'Builds', 'Works', 'Creations', 'Innovations', 'Solutions', 'Prototypes', 'Concepts', 'Experiments', 'Endeavors']}
                    mainClassName="inline-flex overflow-hidden"
                    staggerFrom="random"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden pb-2"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={2000}
                  />
                </div>
              </div>
            </h1>

            {/* Search and Filter */}
            <div className="pt-stack-md flex justify-center items-center gap-4">
              <div className="flex-1 max-w-xs md:max-w-md relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                  search
                </span>
                <input
                  className="w-full bg-surface-container-low border-none rounded-xl pl-11 py-2 text-body-md focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Search projects..."
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors text-on-surface-variant border border-outline-variant/30 focus:ring-2 focus:ring-primary/20"
                >
                  <span className="material-symbols-outlined text-[20px]">filter_list</span>
                  <span className="text-body-md font-semibold hidden sm:inline">{filterOption}</span>
                </button>
                {showFilter && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-xl z-50 overflow-hidden text-left">
                    {['Recent', 'Oldest', 'Most liked'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setFilterOption(opt); setShowFilter(false); }}
                        className={`w-full text-left px-4 py-3 text-body-md transition-colors ${filterOption === opt ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-container-low text-on-surface'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Project Grid */}
        <section className="px-margin-x pb-stack-xl max-w-container-max mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map(project => (
                <ProjectCard key={project._id} project={project} user={user} />
              ))}



              {filtered.length === 0 && search && (
                <div className="col-span-full text-center py-16 text-on-surface-variant font-body-lg">
                  No projects found for &ldquo;{search}&rdquo;
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container py-stack-lg border-t border-outline-variant/20">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-x max-w-container-max mx-auto gap-stack-lg">
          <div className="flex flex-col items-center md:items-start gap-stack-sm">
            <span className="text-headline-md font-headline-md font-bold text-primary">BuildFolio</span>
            <p className="text-body-md font-body-md text-on-surface-variant">© 2024-28 CS-A. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-stack-lg" />
        </div>
      </footer>
    </div>
  );
}
