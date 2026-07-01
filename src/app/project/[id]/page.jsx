'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import styles from './project.module.css';

export default function ProjectDetail() {
  const params = useParams();
  const id = params.id;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [user, setUser] = useState(null);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchProject();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('Please login to like this project.');
      return;
    }
    setIsLiking(true);
    try {
      const res = await fetch(`/api/projects/${id}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setProject({ ...project, likes: { length: data.likesCount } }); // Simplified update, ideal is returning full list or count
        fetchProject(); // Refetch for accuracy
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await fetch(`/api/projects/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText })
      });
      if (res.ok) {
        setCommentText('');
        fetchProject();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <main>
        <Header />
        <div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>
      </main>
    );
  }

  if (!project) {
    return (
      <main>
        <Header />
        <div style={{ textAlign: 'center', padding: '100px' }}>Project not found.</div>
      </main>
    );
  }

  const hasLiked = user && project.likes?.includes(user._id);

  return (
    <main>
      <Header />
      
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroBg}>
          {project.coverImage ? (
            <img src={project.coverImage} alt={project.title} className={styles.heroImg} />
          ) : (
            <div className={styles.heroPlaceholder}></div>
          )}
        </div>
        <div className={`${styles.heroContent} container`}>
          <div className="glass" style={{ display: 'inline-block', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', marginBottom: '16px' }}>
            {project.category || 'Project'}
          </div>
          <h1 className={styles.title}>{project.title}</h1>
          <div className={styles.meta}>
            <div className={styles.author}>
              <div className={styles.avatar}>{project.studentName.charAt(0).toUpperCase()}</div>
              <div>
                <p className={styles.authorName}>{project.studentName}</p>
                <p className={styles.date}>{new Date(project.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <button 
              onClick={handleLike} 
              disabled={isLiking}
              className={`${styles.likeBtn} ${hasLiked ? styles.liked : ''}`}
            >
              <span>{hasLiked ? '❤️' : '🤍'}</span> 
              <span>{project.likes?.length || 0} Likes</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 20px', paddingBottom: '100px' }}>
        <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '40px' }}>
          
          {/* Main Content */}
          <div className="glass" style={{ padding: '40px' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>About this project</h2>
            <div className={styles.description}>
              {project.description.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {project.screenshots && project.screenshots.length > 0 && (
              <div style={{ marginTop: '40px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Screenshots</h3>
                <div className={styles.gallery}>
                  {project.screenshots.map((src, i) => (
                    <img key={i} src={src} alt={`Screenshot ${i+1}`} className={styles.galleryImg} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="glass" style={{ padding: '40px' }}>
            <h2 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>Discussion ({project.comments?.length || 0})</h2>
            
            {user ? (
              <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                <textarea 
                  className="form-input" 
                  rows="3" 
                  placeholder="Share your thoughts..." 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                ></textarea>
                <div style={{ textAlign: 'right', marginTop: '10px' }}>
                  <button type="submit" className="btn-primary">Post Comment</button>
                </div>
              </form>
            ) : (
              <div className="glass" style={{ padding: '20px', textAlign: 'center', marginBottom: '30px' }}>
                <p>Please login to leave a comment.</p>
              </div>
            )}

            <div className={styles.commentsList}>
              {project.comments && project.comments.map((comment, i) => (
                <div key={i} className={styles.comment}>
                  <div className={styles.commentAvatar}>{comment.userName.charAt(0).toUpperCase()}</div>
                  <div className={styles.commentContent}>
                    <div className={styles.commentMeta}>
                      <span className={styles.commentAuthor}>{comment.userName}</span>
                      <span className={styles.commentDate}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className={styles.commentText}>{comment.text}</p>
                  </div>
                </div>
              ))}
              {(!project.comments || project.comments.length === 0) && (
                <p style={{ color: 'var(--text-secondary)' }}>No comments yet. Be the first to start the discussion!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
