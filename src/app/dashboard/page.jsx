'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [authChecking, setAuthChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const router = useRouter();

  // Form state (matching Stitch form fields)
  const [title, setTitle] = useState('');
  const [overview, setOverview] = useState('');
  const [impact, setImpact] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [techTags, setTechTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [contributors, setContributors] = useState([{ name: '', role: '' }]);
  const [category, setCategory] = useState('Web Development');

  const coverRef = useRef(null);
  const galleryRef = useRef(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) { router.push('/login'); return; }
        setUser(data);
        setAuthChecking(false);
        fetchMyProjects(data.name);
      })
      .catch(() => router.push('/login'));
  }, []);

  const fetchMyProjects = async (name) => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const all = await res.json();
        setProjects(all.filter(p => p.userId === user?._id || p.studentName === name));
      }
    } finally { setLoading(false); }
  };

  const processImage = (file) => new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 1000;
        const scale = Math.min(MAX / img.width, MAX / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  const handleCoverChange = async (e) => {
    if (e.target.files?.[0]) setCoverImage(await processImage(e.target.files[0]));
  };

  const handleGalleryChange = async (e) => {
    if (!e.target.files?.length) return;
    const newImgs = await Promise.all([...e.target.files].map(processImage));
    setGalleryImages(prev => [...prev, ...newImgs]);
    if (galleryRef.current) galleryRef.current.value = '';
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !techTags.includes(t)) setTechTags([...techTags, t]);
    setTagInput('');
  };

  const removeTag = (tag) => setTechTags(techTags.filter(t => t !== tag));

  const addContributor = () => setContributors([...contributors, { name: '', role: '' }]);
  const removeContributor = (i) => setContributors(contributors.filter((_, idx) => idx !== i));
  const updateContributor = (i, field, val) => {
    const arr = [...contributors];
    arr[i][field] = val;
    setContributors(arr);
  };

  const resetForm = () => {
    setTitle(''); setOverview(''); setImpact(''); setDemoUrl(''); setGithubUrl('');
    setCoverImage(null); setGalleryImages([]); setTechTags([]); setTagInput('');
    setContributors([{ name: '', role: '' }]); setCategory('Web Development');
    setIsEditing(false); setEditId(null);
    if (coverRef.current) coverRef.current.value = '';
    if (galleryRef.current) galleryRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title, description: overview, impact, demoUrl, githubUrl,
        coverImage, screenshots: galleryImages, techStack: techTags,
        contributors: contributors.filter(c => c.name.trim()), category
      };
      const url = isEditing ? `/api/projects/${editId}` : '/api/projects';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { resetForm(); fetchMyProjects(user.name); }
      else alert('Failed to save project. Please try again.');
    } finally { setSubmitting(false); }
  };

  const startEdit = async (id) => {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setTitle(data.title); setOverview(data.description || ''); setImpact(data.impact || '');
    setDemoUrl(data.demoUrl || ''); setGithubUrl(data.githubUrl || '');
    setCoverImage(data.coverImage); setGalleryImages(data.screenshots || []);
    setTechTags(data.techStack || []); setContributors(data.contributors?.length ? data.contributors : [{ name: '', role: '' }]);
    setCategory(data.category || 'Web Development');
    setEditId(id); setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok) fetchMyProjects(user.name);
  };

  if (authChecking) return (
    <main style={{ background: 'var(--background)', minHeight: '100vh' }}>
      <Header />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="loading-spinner" />
      </div>
    </main>
  );

  return (
    <main style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      <Header />

      <div className="container" style={{ paddingTop: '104px', paddingBottom: '64px', maxWidth: '840px' }}>
        {/* Page Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 className="font-headline-lg" style={{ color: 'var(--primary)', marginBottom: '8px' }}>
            {isEditing ? 'Edit Project' : 'Add Your Project Details'}
          </h1>
        </div>

        {/* Form Container */}
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <form id="project-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Project Title */}
            <div>
              <label className="form-label">Project Title</label>
              <input type="text" required className="form-input" style={{ marginTop: '6px' }} placeholder="e.g. Autonomous Drone Navigation System" value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            {/* Category */}
            <div>
              <label className="form-label">Category</label>
              <select className="form-input" style={{ marginTop: '6px' }} value={category} onChange={e => setCategory(e.target.value)}>
                <option>Web Development</option>
                <option>Mobile App</option>
                <option>AI / Machine Learning</option>
                <option>Game Development</option>
                <option>Robotics</option>
                <option>Other</option>
              </select>
            </div>

            {/* Cover Thumbnail */}
            <div>
              <label className="form-label">Cover Thumbnail</label>
              <div className="upload-area" style={{ marginTop: '6px', position: 'relative', height: coverImage ? 'auto' : '256px' }}>
                {coverImage ? (
                  <div style={{ position: 'relative', width: '100%' }}>
                    <img src={coverImage} alt="Cover" style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: '8px' }} />
                    <button type="button" onClick={() => { setCoverImage(null); if(coverRef.current) coverRef.current.value=''; }} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px', zIndex: 1 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--secondary)', marginBottom: '8px', display: 'block' }}>upload_file</span>
                    <p className="font-body-md" style={{ fontWeight: 600, color: 'var(--on-surface)' }}>Click or drag to upload cover image</p>
                    <p className="font-label-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>Recommended: 1920×1080px (JPG, PNG)</p>
                  </div>
                )}
                {!coverImage && <input type="file" accept="image/*" onChange={handleCoverChange} ref={coverRef} />}
              </div>
            </div>

            {/* Project Overview */}
            <div>
              <label className="form-label">Project Overview</label>
              <div style={{ marginTop: '6px', border: '1px solid var(--outline-variant)', borderRadius: '8px', overflow: 'hidden', background: 'var(--surface-container-lowest)' }}>
                {/* Toolbar */}
                <div style={{ display: 'flex', gap: '4px', padding: '8px', borderBottom: '1px solid rgba(198,198,205,0.3)', background: 'var(--surface-container-low)' }}>
                  {['format_bold','format_italic','format_list_bulleted','link'].map(icon => (
                    <button key={icon} type="button" style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--surface-container-highest)'}
                      onMouseOut={e => e.currentTarget.style.background = 'none'}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>
                    </button>
                  ))}
                </div>
                <textarea required className="form-input" rows="6" placeholder="Describe the problem, your solution, and key features..." value={overview} onChange={e => setOverview(e.target.value)} style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }} />
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <label className="form-label">Tech Stack &amp; Tools</label>
              <div style={{ marginTop: '6px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  {techTags.map(tag => (
                    <span key={tag} className="chip">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>close</span>
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text" className="form-input" placeholder="Add a tool (e.g. AWS, Docker, PyTorch) and press Enter"
                    value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    style={{ paddingRight: '48px' }}
                  />
                  <button type="button" onClick={addTag} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', display: 'flex', alignItems: 'center', padding: '6px', borderRadius: '50%' }}>
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Gallery Images */}
            <div>
              <label className="form-label">Gallery Images</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px', marginTop: '6px' }}>
                {galleryImages.map((src, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={src} alt={`Gallery ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✕</button>
                  </div>
                ))}
                {/* Add Media slot */}
                <div style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', background: 'var(--surface-container-low)', border: '2px dashed rgba(198,198,205,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)', fontSize: '24px' }}>add_photo_alternate</span>
                  <span className="font-label-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>Add Media</span>
                  <input type="file" accept="image/*" multiple onChange={handleGalleryChange} ref={galleryRef} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                </div>
              </div>
            </div>

            {/* Project Impact */}
            <div>
              <label className="form-label">Project Impact</label>
              <textarea className="form-input" rows="4" style={{ marginTop: '6px' }} placeholder="What difference did this project make? Any metrics or specific outcomes?" value={impact} onChange={e => setImpact(e.target.value)} />
            </div>

            {/* Links */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label className="form-label">Demo Video URL</label>
                <div className="form-input-icon" style={{ marginTop: '6px' }}>
                  <span className="material-symbols-outlined icon">videocam</span>
                  <input type="url" className="form-input" placeholder="https://youtube.com/..." value={demoUrl} onChange={e => setDemoUrl(e.target.value)} style={{ paddingLeft: '42px' }} />
                </div>
              </div>
              <div>
                <label className="form-label">GitHub Repository</label>
                <div className="form-input-icon" style={{ marginTop: '6px' }}>
                  <span className="material-symbols-outlined icon">code</span>
                  <input type="url" className="form-input" placeholder="https://github.com/..." value={githubUrl} onChange={e => setGithubUrl(e.target.value)} style={{ paddingLeft: '42px' }} />
                </div>
              </div>
            </div>

            {/* Contributors */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label className="form-label">Contributors</label>
                <button type="button" onClick={addContributor} style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-label)', fontSize: '12px', fontWeight: 500 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person_add</span>
                  Add Contributor
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {contributors.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', padding: '16px', background: 'var(--surface-container-low)', borderRadius: '8px', border: '1px solid rgba(198,198,205,0.2)' }}>
                    <div style={{ flex: 1 }}>
                      <div className="font-label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: '6px', fontSize: '10px', fontWeight: 600 }}>Full Name</div>
                      <input type="text" value={c.name} onChange={e => updateContributor(i, 'name', e.target.value)} className="form-input" style={{ border: 'none', background: 'var(--surface-container-lowest)', padding: '8px 0 8px 0', borderRadius: 0, borderBottom: '1px solid var(--outline-variant)' }} placeholder="Jane Doe" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="font-label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: '6px', fontSize: '10px', fontWeight: 600 }}>Role</div>
                      <input type="text" value={c.role} onChange={e => updateContributor(i, 'role', e.target.value)} className="form-input" style={{ border: 'none', background: 'var(--surface-container-lowest)', padding: '8px 0 8px 0', borderRadius: 0, borderBottom: '1px solid var(--outline-variant)' }} placeholder="Lead Developer" />
                    </div>
                    <button type="button" onClick={() => removeContributor(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', padding: '8px' }}>
                      <span className="material-symbols-outlined">delete_outline</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ paddingTop: '32px', display: 'flex', gap: '16px', borderTop: '1px solid rgba(198,198,205,0.2)', flexWrap: 'wrap' }}>
              <button type="submit" disabled={submitting} style={{ flex: 1, padding: '16px', background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'var(--font-headline)', fontSize: '24px', fontWeight: 600, transition: 'opacity 0.2s, transform 0.2s', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Saving...' : (isEditing ? 'Update Project' : 'Submit Project')}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} style={{ padding: '16px 40px', background: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'var(--font-headline)', fontSize: '24px', fontWeight: 600 }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* === MY PROJECTS === */}
        {projects.length > 0 && (
          <div style={{ marginTop: '48px' }}>
            <h2 className="font-headline-lg" style={{ marginBottom: '24px' }}>My Projects</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {projects.map(p => (
                <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--surface-container-lowest)', borderRadius: '12px', border: '1px solid rgba(198,198,205,0.2)' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                    {p.coverImage ? <img src={p.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📁</div>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 className="font-body-md" style={{ fontWeight: 600 }}>{p.title}</h3>
                    <p className="font-label-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>{new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => startEdit(p._id)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>Edit</button>
                    <button onClick={() => handleDelete(p._id)} style={{ padding: '8px 16px', background: 'var(--error-container)', color: 'var(--on-error-container)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-label)', fontSize: '14px', fontWeight: 500 }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
