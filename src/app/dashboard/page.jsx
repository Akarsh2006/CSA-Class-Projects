'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import styles from './dashboard.module.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [coverImage, setCoverImage] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [editId, setEditId] = useState(null);

  const fileInputRef = useRef(null);
  const screenshotsRef = useRef(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        fetchMyProjects();
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error(error);
      router.push('/login');
    } finally {
      setAuthChecking(false);
    }
  };

  const fetchMyProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        // Since API doesn't filter by user yet, we filter on client (or ideally fix API)
        // For now, we'll fetch all and filter by current user name (assuming name is unique enough for demo)
        // Note: A better approach is to add a `/api/users/me/projects` endpoint.
        const myProj = data.filter(p => p.studentName === user?.name);
        setProjects(myProj);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Image Processing
  const processImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCoverChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await processImage(e.target.files[0]);
      setCoverImage(base64);
    }
  };

  const handleScreenshotsChange = async (e) => {
    if (e.target.files) {
      const newScreenshots = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const base64 = await processImage(e.target.files[i]);
        newScreenshots.push(base64);
      }
      setScreenshots([...screenshots, ...newScreenshots]);
    }
  };

  const removeScreenshot = (index) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const projectData = {
      title,
      description,
      category,
      coverImage,
      screenshots
    };

    try {
      const url = isEditing ? `/api/projects/${editId}` : '/api/projects';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      if (res.ok) {
        resetForm();
        fetchMyProjects();
      } else {
        alert('Failed to save project');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchMyProjects();
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const startEdit = async (id) => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title);
        setDescription(data.description);
        setCategory(data.category || 'Other');
        setCoverImage(data.coverImage);
        setScreenshots(data.screenshots || []);
        setEditId(id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Web Development');
    setCoverImage(null);
    setScreenshots([]);
    setEditId(null);
    setIsEditing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (screenshotsRef.current) screenshotsRef.current.value = '';
  };

  if (authChecking) {
    return <div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>;
  }

  return (
    <main>
      <Header />
      <div className="container slide-up" style={{ padding: '40px 20px' }}>
        <div className={styles.dashboardHeader}>
          <h1 style={{ fontSize: '2rem' }}>Student <span className="gradient-text">Dashboard</span></h1>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '40px' }}>
          {/* Form Section */}
          <div className={`${styles.formSection} glass`}>
            <h2>{isEditing ? 'Edit Project' : 'Add New Project'}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className="form-group">
                <label className="form-label">Project Title</label>
                <input required type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="AI / Machine Learning">AI / Machine Learning</option>
                  <option value="Game Development">Game Development</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea required className="form-input" rows="5" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Cover Image</label>
                <div className={styles.uploadArea}>
                  <input type="file" accept="image/*" onChange={handleCoverChange} ref={fileInputRef} />
                  {coverImage && (
                    <div className={styles.previewContainer}>
                      <img src={coverImage} alt="Cover Preview" className={styles.preview} />
                      <button type="button" className="btn-danger" onClick={() => { setCoverImage(null); fileInputRef.current.value = ''; }}>Remove</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Screenshots</label>
                <div className={styles.uploadArea}>
                  <input type="file" accept="image/*" multiple onChange={handleScreenshotsChange} ref={screenshotsRef} />
                  {screenshots.length > 0 && (
                    <div className={styles.screenshotsGrid}>
                      {screenshots.map((src, i) => (
                        <div key={i} className={styles.screenshotPreview}>
                          <img src={src} alt={`Screenshot ${i}`} />
                          <button type="button" onClick={() => removeScreenshot(i)} className={styles.removeBtn}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formActions}>
                {isEditing && (
                  <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
                )}
                <button type="submit" className="btn-primary" disabled={submitLoading}>
                  {submitLoading ? 'Saving...' : (isEditing ? 'Update Project' : 'Upload Project')}
                </button>
              </div>
            </form>
          </div>

          {/* List Section */}
          <div className={`${styles.listSection} glass`}>
            <h2>My Projects</h2>
            {loading ? (
              <p>Loading your projects...</p>
            ) : projects.length > 0 ? (
              <div className={styles.projectList}>
                {projects.map((project) => (
                  <div key={project._id} className={styles.projectListItem}>
                    <div className={styles.projectItemInfo}>
                      <div className={styles.projectItemImg}>
                        {project.coverImage ? <img src={project.coverImage} alt="Cover" /> : <div className={styles.placeholder}>🖼️</div>}
                      </div>
                      <div>
                        <h3>{project.title}</h3>
                        <p className={styles.date}>{new Date(project.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className={styles.projectItemActions}>
                      <button onClick={() => startEdit(project._id)} className="btn-secondary">Edit</button>
                      <button onClick={() => handleDelete(project._id)} className="btn-danger">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>You haven't uploaded any projects yet.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
