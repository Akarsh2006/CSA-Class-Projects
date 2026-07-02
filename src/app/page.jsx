'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.ok ? r.json() : [])
      .then(data => { setProjects(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.studentName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* TopNavBar */}
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="hero-gradient pt-stack-xl pb-stack-lg px-margin-x">
          <div className="max-w-container-max mx-auto text-center space-y-stack-md">
            <h1 className="text-display font-display tracking-tight text-on-surface mb-stack-sm">
              2024-28
              <div>
                &nbsp;<span className="text-secondary">CS-A</span>
                <br />Student Projects
              </div>
            </h1>

            {/* Search bar */}
            <div className="pt-stack-md flex justify-center">
              <div className="hidden md:flex relative max-w-md w-full group">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(project => (
                <ProjectCard key={project._id} project={project} />
              ))}

              {/* Submit Project Card (6th slot) */}
              <Link
                href="/dashboard"
                className="group relative aspect-[4/5] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-outline-variant/10 block"
              >
                <div className="absolute inset-0 bg-surface-container-highest flex flex-col items-center justify-center p-stack-lg text-center gap-stack-md">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-outline flex items-center justify-center text-outline group-hover:text-primary group-hover:border-primary transition-all duration-300">
                    <span className="material-symbols-outlined text-[40px]">add</span>
                  </div>
                  <div>
                    <h3 className="text-headline-md font-headline-md text-on-surface">Submit Project</h3>
                  </div>
                </div>
              </Link>

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
            <span className="text-headline-md font-headline-md font-bold text-primary">ProjectHub</span>
            <p className="text-body-md font-body-md text-on-surface-variant">© 2024-28 CS-A. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-stack-lg" />
          <div className="flex items-center gap-stack-md">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center hover:bg-secondary hover:text-white transition-all cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
}
