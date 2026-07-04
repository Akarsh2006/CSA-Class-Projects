'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import ImageCropper from '@/components/ImageCropper';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [authChecking, setAuthChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const router = useRouter();

  // Form state (matching Stitch fields)
  const [title, setTitle] = useState('');
  const [teamName, setTeamName] = useState('');
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
  const [selectedImageForCrop, setSelectedImageForCrop] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

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
    const res = await fetch('/api/projects');
    if (res.ok) {
      const all = await res.json();
      setProjects((Array.isArray(all) ? all : []).filter(p => p.studentName === name));
    }
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
    if (e.target.files?.[0]) {
      const processed = await processImage(e.target.files[0]);
      setSelectedImageForCrop(processed);
      setShowCropper(true);
    }
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
    const arr = [...contributors]; arr[i][field] = val; setContributors(arr);
  };

  const resetForm = () => {
    setTitle(''); setTeamName(''); setOverview(''); setImpact(''); setDemoUrl(''); setGithubUrl('');
    setCoverImage(null); setGalleryImages([]); setTechTags([]); setTagInput('');
    setContributors([{ name: '', role: '' }]); setCategory('Web Development');
    setIsEditing(false); setEditId(null);
    if (coverRef.current) coverRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (techTags.length === 0) {
      alert('Please add at least one tech stack or tool.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title, teamName, description: overview, impact, demoUrl, githubUrl,
        coverImage, screenshots: galleryImages, techStack: techTags,
        contributors: contributors.filter(c => c.name.trim()), category,
      };
      const url = isEditing ? `/api/projects/${editId}` : '/api/projects';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { resetForm(); if (user) fetchMyProjects(user.name); }
      else alert('Failed to save project. Please try again.');
    } finally { setSubmitting(false); }
  };

  const startEdit = async (id) => {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setTitle(data.title); setTeamName(data.teamName || ''); setOverview(data.description || ''); setImpact(data.impact || '');
    setDemoUrl(data.demoUrl || ''); setGithubUrl(data.githubUrl || '');
    setCoverImage(data.coverImage); setGalleryImages(data.screenshots || []);
    setTechTags(data.techStack || []); setCategory(data.category || 'Web Development');
    setContributors(data.contributors?.length ? data.contributors : [{ name: '', role: '' }]);
    setEditId(id); setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok && user) fetchMyProjects(user.name);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  if (authChecking) return (
    <div className="bg-surface text-on-surface font-body-md antialiased">
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased">
      {showCropper && (
        <ImageCropper
          image={selectedImageForCrop}
          onComplete={(croppedImg) => {
            setCoverImage(croppedImg);
            setShowCropper(false);
          }}
          onCancel={() => {
            setShowCropper(false);
            if (coverRef.current) coverRef.current.value = '';
          }}
        />
      )}
      <Header />

      <main className="pt-32 pb-stack-xl px-margin-x max-w-[800px] mx-auto">
        {/* Back Button */}
        <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Are you sure you want to go back? Any unsaved data will be lost.")) {
                router.push('/');
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg font-label-md font-semibold transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back
          </button>
        </div>

        {/* Page Title */}
        <div className="mb-stack-lg text-center">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">
            {isEditing ? 'Edit Project' : 'Add Your Project Details'}
          </h1>
        </div>

        {/* Form Container */}
        <div className="glass-panel p-8 rounded-xl shadow-sm space-y-8">
          <form className="space-y-8" id="project-submission-form" onSubmit={handleSubmit}>

            {/* Project Title */}
            <div className="space-y-2">
              <label className="text-label-sm font-label-sm text-on-surface uppercase tracking-wider" htmlFor="project-title">
                Project Title <span className="text-error">*</span>
              </label>
              <input
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-body-md transition-all"
                id="project-title" type="text" required
                placeholder="e.g. Autonomous Drone Navigation System"
                value={title} onChange={e => setTitle(e.target.value)}
              />
            </div>

            {/* Team Name */}
            <div className="space-y-2">
              <label className="text-label-sm font-label-sm text-on-surface uppercase tracking-wider" htmlFor="team-name">
                Team Name <span className="text-on-surface-variant normal-case">(Optional)</span>
              </label>
              <input
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-body-md transition-all"
                id="team-name" type="text"
                placeholder="e.g. Cyber Squad (Leave blank to use your name)"
                value={teamName} onChange={e => setTeamName(e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-label-sm font-label-sm text-on-surface uppercase tracking-wider">Category</label>
              <select
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-body-md transition-all"
                value={category} onChange={e => setCategory(e.target.value)}
              >
                <option>Web Development</option>
                <option>Mobile App</option>
                <option>AI / Machine Learning</option>
                <option>Game Development</option>
                <option>Robotics</option>
                <option>Other</option>
              </select>
            </div>

            {/* Cover Thumbnail */}
            <div className="space-y-2">
              <label className="text-label-sm font-label-sm text-on-surface uppercase tracking-wider">Cover Thumbnail</label>
              <div className="relative h-64 w-full group rounded-lg border-2 border-dashed border-outline-variant/50 flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer overflow-hidden">
                {coverImage ? (
                  <div className="relative w-full h-full">
                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setCoverImage(null); if (coverRef.current) coverRef.current.value = ''; }}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative text-center p-6 pointer-events-none">
                      <span className="material-symbols-outlined text-4xl text-secondary mb-2 block">upload_file</span>
                      <p className="text-body-md font-semibold text-on-surface">Click or drag to upload cover image</p>
                      <p className="text-label-sm text-on-surface-variant mt-1">Recommended size: 1920x1080px (JPG, PNG)</p>
                    </div>
                    <input className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" type="file" accept="image/*" onChange={handleCoverChange} ref={coverRef} />
                  </>
                )}
              </div>
            </div>

            {/* Project Overview */}
            <div className="space-y-2">
              <label className="text-label-sm font-label-sm text-on-surface uppercase tracking-wider" htmlFor="project-overview">
                Project Overview <span className="text-error">*</span>
              </label>
              <div className="border border-outline-variant/30 rounded-lg overflow-hidden bg-surface-container-lowest">
                {/* Toolbar */}
                <div className="flex gap-2 p-2 border-b border-outline-variant/30 bg-surface-container-low">
                  {['format_bold', 'format_italic', 'format_list_bulleted', 'link'].map(icon => (
                    <button key={icon} type="button" className="p-1 hover:bg-surface-container-highest rounded">
                      <span className="material-symbols-outlined text-sm">{icon}</span>
                    </button>
                  ))}
                </div>
                <textarea
                  className="w-full px-4 py-3 border-none focus:ring-0 text-body-md"
                  id="project-overview"
                  placeholder="Describe the problem, your solution, and the key features..."
                  rows="6"
                  required
                  value={overview}
                  onChange={e => setOverview(e.target.value)}
                />
              </div>
            </div>

            {/* Tech Stack & Tools */}
            <div className="space-y-2">
              <label className="text-label-sm font-label-sm text-on-surface uppercase tracking-wider">
                Tech Stack &amp; Tools <span className="text-error">*</span>
              </label>
              <div className="space-y-3">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3" id="tag-container">
                  {techTags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-highest text-on-surface-variant rounded-full text-label-md font-label-md">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-error">
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    </span>
                  ))}
                </div>
                {/* Input */}
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-body-md pr-12 transition-all"
                    placeholder="Add a tool (e.g. AWS, Docker, PyTorch) and press Enter"
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  />
                  <button
                    type="button" onClick={addTag}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:bg-secondary-fixed p-1.5 rounded-full transition-all"
                  >
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Gallery Images */}
            <div className="space-y-2">
              <label className="text-label-sm font-label-sm text-on-surface uppercase tracking-wider">Gallery Images</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {galleryImages.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                    <img src={src} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/80"
                    >✕</button>
                  </div>
                ))}
                {/* Add Media slot */}
                <div className="aspect-square bg-surface-container-low border-2 border-dashed border-outline-variant/50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container transition-all group relative overflow-hidden">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary">add_photo_alternate</span>
                  <span className="text-[10px] mt-1 font-label-sm text-on-surface-variant">Add Media</span>
                  <input className="absolute inset-0 opacity-0 cursor-pointer" type="file" accept="image/*" multiple onChange={handleGalleryChange} ref={galleryRef} />
                </div>
              </div>
            </div>

            {/* Project Impact */}
            <div className="space-y-2">
              <label className="text-label-sm font-label-sm text-on-surface uppercase tracking-wider" htmlFor="project-impact">
                Project Impact <span className="text-error">*</span>
              </label>
              <textarea
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-body-md transition-all"
                id="project-impact"
                placeholder="What difference did this project make? Any metrics or specific outcomes?"
                rows="4"
                required
                value={impact}
                onChange={e => setImpact(e.target.value)}
              />
            </div>

            {/* Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-label-sm font-label-sm text-on-surface uppercase tracking-wider" htmlFor="demo-url">Demo Video URL</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">videocam</span>
                  <input className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-body-md transition-all" id="demo-url" type="url" placeholder="https://youtube.com/..." value={demoUrl} onChange={e => setDemoUrl(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-label-sm font-label-sm text-on-surface uppercase tracking-wider" htmlFor="github-url">GitHub Repository</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">code</span>
                  <input className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-body-md transition-all" id="github-url" type="url" placeholder="https://github.com/user/repo" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Contributors */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-label-sm font-label-sm text-on-surface uppercase tracking-wider">Contributors</label>
                <button type="button" onClick={addContributor} className="text-secondary text-label-sm font-label-sm hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">person_add</span> Add Contributor
                </button>
              </div>
              <div className="space-y-3" id="contributors-list">
                {contributors.map((c, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-surface-container-low rounded-lg border border-outline-variant/20 items-end">
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] text-on-surface-variant uppercase font-semibold">Full Name</label>
                      <input
                        className="w-full bg-surface-container-lowest border-none p-0 text-body-md focus:ring-0"
                        type="text" placeholder="Jane Doe"
                        value={c.name} onChange={e => updateContributor(i, 'name', e.target.value)}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] text-on-surface-variant uppercase font-semibold">Role</label>
                      <input
                        className="w-full bg-surface-container-lowest border-none p-0 text-body-md focus:ring-0"
                        type="text" placeholder="Lead Developer"
                        value={c.role} onChange={e => updateContributor(i, 'role', e.target.value)}
                      />
                    </div>
                    <button type="button" onClick={() => removeContributor(i)} className="p-2 text-on-surface-variant hover:text-error transition-colors">
                      <span className="material-symbols-outlined">delete_outline</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-8 flex flex-col md:flex-row gap-4 border-t border-outline-variant/20">
              <button
                type="submit" disabled={submitting}
                className="flex-1 py-4 bg-primary text-on-primary font-headline-md text-headline-md rounded-xl hover:bg-primary-container transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70"
              >
                {submitting ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (isEditing ? 'Update Project' : 'Submit Project')}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="px-10 py-4 bg-surface-container-highest text-on-surface font-headline-md text-headline-md rounded-xl hover:bg-outline-variant/40 transition-all">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* My Projects */}
        {projects.length > 0 && (
          <div className="mt-12">
            <h2 className="text-headline-lg font-headline-lg mb-6">My Projects</h2>
            <div className="space-y-3">
              {projects.map(p => (
                <div key={p._id} className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-high">
                    {p.coverImage
                      ? <img src={p.coverImage} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl opacity-40">📁</div>
                    }
                  </div>
                  <div className="flex-1">
                    <h3 className="font-body-md font-semibold text-on-surface">{p.title}</h3>
                    <p className="text-label-sm text-on-surface-variant mt-1">{new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(p._id)} className="px-4 py-2 text-label-md font-label-md text-on-surface-variant hover:bg-surface-container-low transition-all rounded-lg">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="px-4 py-2 text-label-md font-label-md text-on-error-container bg-error-container hover:opacity-80 transition-all rounded-lg">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-stack-lg bg-surface-container border-t border-outline-variant/20">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-x max-w-container-max mx-auto gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="text-headline-md font-headline-md font-bold text-primary">BuildFolio</div>
            <p className="text-label-sm font-label-sm text-on-surface-variant">© 2024-28 CS-A. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
