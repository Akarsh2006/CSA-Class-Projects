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
      .then(data => { setProjects(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.studentName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main style={{ backgroundColor: 'var(--background)' }}>
      <Header />

      {/* Hero Section */}
      <section className="hero-gradient" style={{ paddingTop: '80px' }}>
        <div className="container" style={{ textAlign: 'center', paddingTop: '64px', paddingBottom: '32px' }}>
          <h1 className="font-display" style={{ color: 'var(--on-surface)', marginBottom: '8px', fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: '1.1' }}>
            2024-28&nbsp;
            <span style={{ color: 'var(--secondary)' }}>CS-A</span>
            <br />
            Student Projects
          </h1>

          {/* Search bar */}
          <div style={{ paddingTop: '24px', display: 'flex', justifyContent: 'center' }}>
            <div className="topnav-search" style={{ display: 'block', maxWidth: '520px', width: '100%' }}>
              <span className="material-symbols-outlined topnav-search-icon">search</span>
              <input
                placeholder="Search projects or students..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ borderRadius: '12px', padding: '12px 16px 12px 44px', fontSize: '16px', width: '100%', background: 'var(--surface-container-low)', border: 'none', outline: 'none', color: 'var(--on-surface)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Project Grid */}
      <section className="container" style={{ paddingBottom: '64px', paddingTop: '0' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--on-surface-variant)' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
            <p className="font-body-md">Loading projects...</p>
          </div>
        ) : (
          <div className="project-grid">
            {filtered.map(project => (
              <ProjectCard key={project._id} project={project} />
            ))}

            {/* Submit Project Card */}
            <Link href="/dashboard" className="project-card-add">
              <div className="add-circle">
                <span className="material-symbols-outlined">add</span>
              </div>
              <h3 className="font-headline-md" style={{ color: 'var(--on-surface)' }}>Submit Project</h3>
            </Link>
          </div>
        )}

        {!loading && filtered.length === 0 && search && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--on-surface-variant)' }}>
            <p className="font-body-lg">No projects found for "{search}"</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <div className="font-headline-md" style={{ color: 'var(--primary)', fontWeight: 700 }}>ProjectHub</div>
            <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>© 2024-28 CS-A. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
