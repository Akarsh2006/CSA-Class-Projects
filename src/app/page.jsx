'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import ProjectCard from '@/components/ProjectCard';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.studentName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main>
      <Header />
      
      <section className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h1 className="slide-up" style={{ fontSize: '3rem', marginBottom: '16px' }}>
          Class Projects <span className="gradient-text">Showcase</span>
        </h1>
        <p className="slide-up" style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '40px', animationDelay: '0.1s' }}>
          Discover the amazing work created by our students.
        </p>
        
        <div className="slide-up" style={{ animationDelay: '0.2s', marginBottom: '60px' }}>
          <SearchBar value={search} onSearch={setSearch} />
        </div>
      </section>

      <section className="container fade-in" style={{ paddingBottom: '100px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading projects...</p>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-2 grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        ) : (
          <div className="glass" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>No projects found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {search ? 'Try adjusting your search criteria.' : 'Be the first to upload a project!'}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
