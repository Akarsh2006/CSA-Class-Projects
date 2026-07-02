'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.ok ? r.json() : null),
      fetch(`/api/projects/${id}`).then(r => r.ok ? r.json() : null),
    ]).then(([userData, projectData]) => {
      if (userData) setUser(userData);
      if (projectData) setProject(projectData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const refetch = () =>
    fetch(`/api/projects/${id}`).then(r => r.ok ? r.json() : null).then(d => { if (d) setProject(d); });

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
      body: JSON.stringify({ text: commentText }),
    });
    setCommentText('');
    await refetch();
  };

  if (loading) return (
    <body className="bg-background text-on-background font-body-md">
      <Header />
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    </body>
  );

  if (!project) return (
    <body className="bg-background text-on-background font-body-md">
      <Header />
      <div className="text-center pt-40 text-on-surface-variant">
        <h2 className="text-headline-lg font-headline-lg mb-6">Project not found</h2>
        <Link href="/" className="px-6 py-3 bg-primary text-on-primary rounded-xl font-label-md font-semibold hover:opacity-90 transition-all">← Back to Home</Link>
      </div>
    </body>
  );

  const hasLiked = user && Array.isArray(project.likes) && project.likes.some(l => l.toString() === user._id?.toString());
  const likesCount = Array.isArray(project.likes) ? project.likes.length : 0;
  const allImages = [project.coverImage, ...(project.screenshots || [])].filter(Boolean);

  return (
    <body className="bg-background text-on-background font-body-md">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 transition-all duration-300">
        <div className="flex justify-between items-center h-20 px-margin-x max-w-container-max mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-headline-md font-headline-md font-bold tracking-tight text-primary">ProjectHub</Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-label-md font-label-md text-on-surface-variant hidden sm:block">Hi, {user.name}</span>
                <Link href="/dashboard" className="px-5 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 text-label-md font-label-md">Dashboard</Link>
              </>
            ) : (
              <>
                <Link href="/login" className="px-5 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 text-label-md font-label-md">Log in</Link>
                <Link href="/register" className="px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:opacity-90 transition-all duration-200 text-label-md font-label-md">Register</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-24 pb-stack-xl px-margin-x max-w-container-max mx-auto">

        {/* === HERO: 12-col grid === */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-stack-xl animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* Left: tall portrait card — col-span-5 */}
          <div className="lg:col-span-5 relative group overflow-hidden rounded-[2rem] h-[600px] lg:h-[700px] shadow-2xl">
            {project.coverImage ? (
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={project.coverImage}
                alt={project.title}
              />
            ) : (
              <div className="w-full h-full bg-surface-container-highest flex items-center justify-center text-7xl opacity-30">📁</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-10 w-full">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-label-sm font-label-sm">
                  {new Date(project.createdAt).getFullYear()}
                </span>
                {project.category && (
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-label-sm font-label-sm">
                    {project.category}
                  </span>
                )}
              </div>
              <h1 className="text-white font-display text-headline-lg leading-tight mb-2">{project.title}</h1>
              <p className="text-white/80 text-body-md mb-6 max-w-sm line-clamp-2">{project.description}</p>
              <div className="flex items-center justify-between pt-6 border-t border-white/20">
                <span className="text-white/80 text-label-md font-label-md">By {project.studentName}</span>
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`bg-white text-primary px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2 ${isLiking ? 'opacity-70' : ''}`}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: hasLiked ? '"FILL" 1' : '"FILL" 0', color: hasLiked ? '#ef4444' : 'inherit' }}>favorite</span>
                  <span>Like</span>
                  <span className="ml-1 opacity-60 font-normal">{likesCount}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: info — col-span-7 */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-stack-lg">
            {/* Tech Stack */}
            {project.techStack && project.techStack.length > 0 && (
              <div className="space-y-stack-md">
                <h2 className="text-headline-md font-headline-md">Tech Stack &amp; Tools</h2>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech, i) => (
                    <span key={i} className="px-4 py-2 bg-surface-container rounded-lg font-label-md text-label-md text-on-surface-variant border border-outline-variant/30">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Project Overview glass card */}
            <div className="p-8 glass-card rounded-3xl">
              <h3 className="text-headline-md font-headline-md mb-4">Project Overview</h3>
              <div className="prose prose-slate max-w-none text-body-md text-on-surface-variant space-y-4">
                {project.description.split('\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {project.demoUrl && (
                <a
                  href={project.demoUrl} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 transition-all"
                >
                  <span className="material-symbols-outlined">launch</span>
                  View Live Demo
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-surface-container-high text-primary rounded-xl font-bold hover:bg-outline-variant/20 transition-all border border-outline-variant/30"
                >
                  <span className="material-symbols-outlined">code</span>
                  GitHub Repository
                </a>
              )}
            </div>
          </div>
        </section>

        {/* === PROJECT IMPACT === */}
        {project.impact && (
          <section className="mb-stack-xl">
            <div className="max-w-container-max mx-auto space-y-stack-lg">
              <div className="space-y-stack-md text-left">
                <h2 className="text-headline-lg font-headline-lg">Project Impact</h2>
                <div className="prose prose-slate max-w-none text-body-lg text-on-surface-variant">
                  <p>{project.impact}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* === IMAGE CAROUSEL === */}
        {allImages.length > 0 && (
          <section className="mb-stack-xl">
            <div className="max-w-container-max mx-auto space-y-stack-lg">
              <div className="relative group">
                {/* Nav arrows */}
                <div className="flex items-center justify-between absolute w-full top-1/2 -translate-y-1/2 z-10 pointer-events-none px-4">
                  <button
                    className="pointer-events-auto w-12 h-12 bg-white/90 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all duration-300"
                    onClick={() => document.getElementById('overview-carousel').scrollBy({ left: -400, behavior: 'smooth' })}
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button
                    className="pointer-events-auto w-12 h-12 bg-white/90 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all duration-300"
                    onClick={() => document.getElementById('overview-carousel').scrollBy({ left: 400, behavior: 'smooth' })}
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>

                <div id="overview-carousel" className="flex gap-gutter overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth rounded-3xl">
                  {allImages.map((src, i) => (
                    <div key={i} className="flex-none w-full md:w-[70%] snap-start">
                      <div className="bg-surface-container rounded-3xl p-6 h-full">
                        <img
                          className="w-full aspect-video object-cover rounded-2xl shadow-sm"
                          src={src}
                          alt={`Screenshot ${i + 1}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* === CONTRIBUTORS === */}
        {project.contributors && project.contributors.length > 0 && (
          <section className="mb-stack-xl rounded-[2.5rem] p-stack-lg border-outline-variant/10">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-headline-lg font-headline-lg mb-4">Core Contributors</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
              {project.contributors.filter(c => c.name).map((c, i) => (
                <div key={i} className="space-y-1">
                  <h4 className="text-headline-md font-headline-md text-on-surface">{c.name}</h4>
                  <p className="text-label-md font-label-md text-secondary">{c.role}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* === COMMENTS / DISCUSSION === */}
        <section className="max-w-4xl mx-auto">
          <div className="bg-surface-container-lowest rounded-3xl p-10 border border-primary/5">
            <h2 className="text-headline-lg font-headline-lg mb-6">
              Discussion ({project.comments?.length || 0})
            </h2>

            {user ? (
              <form onSubmit={handleComment} className="mb-10">
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-bright font-body-md text-on-surface input-academic transition-all resize-none"
                  rows="3"
                  placeholder="Share your thoughts on this project..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  required
                />
                <div className="text-right mt-3">
                  <button type="submit" className="px-6 py-2.5 bg-primary text-on-primary text-label-md font-label-md font-semibold rounded-xl hover:opacity-90 transition-all">
                    Post Comment
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-8 p-4 bg-surface-container-low rounded-xl text-center">
                <p className="font-body-md text-on-surface-variant">
                  <Link href="/login" className="text-primary font-semibold hover:underline">Log in</Link> to leave a comment.
                </p>
              </div>
            )}

            <div className="space-y-6">
              {project.comments?.length ? project.comments.map((c, i) => (
                <div key={i} className="flex gap-4 pb-6 border-b border-surface-container-high last:border-0">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-headline-md font-bold flex-shrink-0">
                    {c.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-body-md font-semibold text-on-surface">{c.userName}</span>
                      <span className="font-label-sm text-on-surface-variant">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="font-body-md text-on-surface-variant leading-relaxed">{c.text}</p>
                  </div>
                </div>
              )) : (
                <p className="font-body-md text-on-surface-variant">No comments yet. Be the first to start the discussion!</p>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container py-stack-lg border-t border-outline-variant/20">
        <div className="max-w-container-max mx-auto px-margin-x text-center">
          <div className="flex flex-col md:flex-row justify-between items-center gap-stack-lg">
            <div className="flex flex-col items-center md:items-start gap-stack-sm">
              <span className="text-headline-md font-headline-md font-bold text-primary">ProjectHub</span>
              <p className="text-body-md font-body-md text-on-surface-variant">© 2024-28 CS-A. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-stack-lg" />
            <div className="flex items-center gap-stack-md">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center hover:bg-secondary hover:text-white transition-all cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>
    </body>
  );
}
