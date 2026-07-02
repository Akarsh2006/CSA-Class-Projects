'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

export default function ProjectDetail() {
  const params = useParams();
  const id = params.id;
  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [activeImg, setActiveImg] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.ok ? r.json() : null),
      fetch(`/api/projects/${id}`).then(r => r.ok ? r.json() : null)
    ]).then(([userData, projectData]) => {
      if (userData) setUser(userData);
      if (projectData) { setProject(projectData); setActiveImg(projectData.coverImage); }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const refetch = () =>
    fetch(`/api/projects/${id}`).then(r => r.ok ? r.json() : null).then(data => { if (data) setProject(data); });

  const handleLike = async () => {
    if (!user) return alert('Please log in to like projects.');
    setIsLiking(true);
    await fetch(`/api/projects/${id}/like`, { method: 'POST' });
    await refetch();
    setIsLiking(false);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    await fetch(`/api/projects/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: commentText })
    });
    setCommentText('');
    await refetch();
  };

  if (loading) return (
    <main style={{ background: 'var(--background)', minHeight: '100vh' }}>
      <Header />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="loading-spinner" />
      </div>
    </main>
  );

  if (!project) return (
    <main style={{ background: 'var(--background)', minHeight: '100vh' }}>
      <Header />
      <div style={{ textAlign: 'center', padding: '120px 32px', color: 'var(--on-surface-variant)' }}>
        <h2 className="font-headline-lg">Project not found</h2>
        <Link href="/" className="btn-primary" style={{ marginTop: '24px', display: 'inline-flex' }}>← Back to Home</Link>
      </div>
    </main>
  );

  const hasLiked = user && Array.isArray(project.likes) && project.likes.includes(user._id);
  const likesCount = Array.isArray(project.likes) ? project.likes.length : 0;
  const allImages = [project.coverImage, ...(project.screenshots || [])].filter(Boolean);

  return (
    <main style={{ background: 'var(--background)', minHeight: '100vh' }}>
      <Header />

      <div className="container" style={{ paddingTop: '104px', paddingBottom: '64px' }}>
        {/* === HERO: 12-col layout === */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '64px', animation: 'fadeIn 0.7s ease forwards' }}>
          <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }`}</style>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            {/* Left: tall hero card */}
            <div style={{ position: 'relative', borderRadius: '32px', overflow: 'hidden', minHeight: '500px', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
              {(activeImg || project.coverImage) ? (
                <img src={activeImg || project.coverImage} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, transition: 'opacity 0.4s' }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #dae2fd, #bec6e0)' }} />
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '40px', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', padding: '4px 12px', borderRadius: '9999px', color: 'white', fontFamily: 'var(--font-label)', fontSize: '12px' }}>
                    {new Date(project.createdAt).getFullYear()}
                  </span>
                  {project.category && (
                    <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', padding: '4px 12px', borderRadius: '9999px', color: 'white', fontFamily: 'var(--font-label)', fontSize: '12px' }}>
                      {project.category}
                    </span>
                  )}
                </div>
                <h1 style={{ color: 'white', fontFamily: 'var(--font-headline)', fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.3, marginBottom: '8px' }}>{project.title}</h1>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-body)', fontSize: '16px', marginBottom: '24px', maxWidth: '480px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{project.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-label)', fontSize: '14px' }}>By {project.studentName}</div>
                  <button
                    onClick={handleLike} disabled={isLiking}
                    style={{
                      background: 'white', color: 'var(--primary)', border: 'none', borderRadius: '12px',
                      padding: '12px 24px', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      transition: 'transform 0.2s',
                      transform: isLiking ? 'scale(0.95)' : 'scale(1)'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: hasLiked ? '"FILL" 1' : '"FILL" 0', color: hasLiked ? '#ef4444' : 'inherit' }}>favorite</span>
                    <span>Like</span>
                    <span style={{ opacity: 0.6, fontWeight: 400 }}>{likesCount}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: info panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Tech Stack */}
              {project.techStack && project.techStack.length > 0 && (
                <div>
                  <h2 className="font-headline-md" style={{ marginBottom: '12px' }}>Tech Stack &amp; Tools</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {project.techStack.map((tech, i) => (
                      <span key={i} className="chip">{tech}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Overview */}
              <div className="glass-card" style={{ padding: '32px', borderRadius: '24px' }}>
                <h3 className="font-headline-md" style={{ marginBottom: '16px' }}>Project Overview</h3>
                <div style={{ color: 'var(--on-surface-variant)' }}>
                  {project.description.split('\n').map((para, i) => (
                    <p key={i} className="font-body-md" style={{ marginBottom: '12px', lineHeight: 1.7 }}>{para}</p>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '16px 24px', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '16px' }}>
                    <span className="material-symbols-outlined">launch</span>
                    View Live Demo
                  </a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '16px 24px', fontWeight: 700, fontSize: '16px' }}>
                    <span className="material-symbols-outlined">code</span>
                    GitHub Repository
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* === IMAGE GALLERY === */}
        {allImages.length > 0 && (
          <section style={{ marginBottom: '64px' }}>
            <h2 className="font-headline-lg" style={{ marginBottom: '24px' }}>Gallery</h2>
            <div style={{ position: 'relative' }}>
              {/* Scroll arrows */}
              <button
                onClick={() => document.getElementById('gallery-scroll').scrollBy({ left: -400, behavior: 'smooth' })}
                style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '48px', height: '48px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', color: 'var(--primary)' }}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                onClick={() => document.getElementById('gallery-scroll').scrollBy({ left: 400, behavior: 'smooth' })}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '48px', height: '48px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', color: 'var(--primary)' }}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>

              <div id="gallery-scroll" className="no-scrollbar" style={{ display: 'flex', gap: '24px', overflowX: 'auto', scrollSnapType: 'x mandatory', borderRadius: '24px' }}>
                {allImages.map((src, i) => (
                  <div key={i} style={{ flex: 'none', width: '70%', scrollSnapAlign: 'start' }}>
                    <div style={{ background: 'var(--surface-container)', borderRadius: '24px', padding: '24px' }}>
                      <img
                        src={src} alt={`Screenshot ${i + 1}`}
                        onClick={() => setActiveImg(src)}
                        style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'transform 0.2s' }}
                        onMouseOver={e => e.target.style.transform = 'scale(1.01)'}
                        onMouseOut={e => e.target.style.transform = 'none'}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* === CONTRIBUTORS === */}
        {project.contributors && project.contributors.length > 0 && (
          <section style={{ marginBottom: '64px' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 className="font-headline-lg">Core Contributors</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '32px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
              {project.contributors.map((c, i) => (
                <div key={i}>
                  <h4 className="font-headline-md" style={{ color: 'var(--on-surface)' }}>{c.name}</h4>
                  <p className="font-label-md" style={{ color: 'var(--secondary)' }}>{c.role}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* === COMMENTS === */}
        <section>
          <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '24px', padding: '40px', border: '1px solid rgba(0,0,0,0.04)' }}>
            <h2 className="font-headline-lg" style={{ marginBottom: '24px' }}>Discussion ({project.comments?.length || 0})</h2>

            {user ? (
              <form onSubmit={handleComment} style={{ marginBottom: '40px' }}>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Share your thoughts on this project..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  required
                />
                <div style={{ textAlign: 'right', marginTop: '12px' }}>
                  <button type="submit" className="btn-primary">Post Comment</button>
                </div>
              </form>
            ) : (
              <div style={{ padding: '20px', background: 'var(--surface-container-low)', borderRadius: '12px', textAlign: 'center', marginBottom: '32px' }}>
                <p className="font-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                  <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log in</Link> to leave a comment.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {project.comments?.length ? project.comments.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', paddingBottom: '24px', borderBottom: '1px solid var(--surface-container-high)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-container-highest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-headline)', fontWeight: 700, flexShrink: 0 }}>
                    {c.userName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px' }}>
                      <span className="font-body-md" style={{ fontWeight: 600 }}>{c.userName}</span>
                      <span className="font-label-sm" style={{ color: 'var(--on-surface-variant)' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>{c.text}</p>
                  </div>
                </div>
              )) : (
                <p className="font-body-md" style={{ color: 'var(--on-surface-variant)' }}>No comments yet. Be the first to start the discussion!</p>
              )}
            </div>
          </div>
        </section>
      </div>

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
