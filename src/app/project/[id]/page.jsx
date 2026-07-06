'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import ImageCropper from '@/components/ImageCropper';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import dynamic from 'next/dynamic';

const ScrambledText = dynamic(() => import('@/components/ScrambledText'), { ssr: false });

const getYoutubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function ProjectDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [deletingComment, setDeletingComment] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit form fields
  const [editTitle, setEditTitle] = useState('');
  const [editTeamName, setEditTeamName] = useState('');
  const [editOverview, setEditOverview] = useState('');
  const [editImpact, setEditImpact] = useState('');
  const [editDemoUrl, setEditDemoUrl] = useState('');
  const [editYoutubeUrl, setEditYoutubeUrl] = useState('');
  const [editGithubUrl, setEditGithubUrl] = useState('');
  const [editCoverImage, setEditCoverImage] = useState(null);
  const [editGalleryImages, setEditGalleryImages] = useState([]);
  const [editTechTags, setEditTechTags] = useState([]);
  const [editTagInput, setEditTagInput] = useState('');
  const [editContributors, setEditContributors] = useState([{ name: '', role: '' }]);
  const [editCategory, setEditCategory] = useState('Web Development');
  const [selectedImageForCrop, setSelectedImageForCrop] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const coverRef = useRef(null);
  const galleryRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.ok ? r.json() : null),
      fetch(`/api/projects/${id}`).then(r => r.ok ? r.json() : null),
    ]).then(([userData, projectData]) => {
      if (userData && userData.user) setUser(userData.user);
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
    if (!commentText.trim() || !user || isPostingComment) return;
    setIsPostingComment(true);
    try {
      await fetch(`/api/projects/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText }),
      });
      setCommentText('');
      await refetch();
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    setDeletingComment(true);
    try {
      const res = await fetch(`/api/projects/${id}/comments/${commentToDelete._id}`, { method: 'DELETE' });
      if (res.ok) {
        await refetch();
      } else {
        alert('Failed to delete comment.');
      }
    } finally {
      setDeletingComment(false);
      setCommentToDelete(null);
    }
  };

  // === Owner check ===
  const isOwner = user && project && (user.userId || user._id)?.toString() === project.userId?.toString();

  // === Edit helpers ===
  const startEditing = () => {
    setEditTitle(project.title || '');
    setEditTeamName(project.teamName || '');
    setEditOverview(project.description || '');
    setEditImpact(project.impact || '');
    setEditDemoUrl(project.demoUrl || '');
    setEditYoutubeUrl(project.youtubeUrl || '');
    setEditGithubUrl(project.githubUrl || '');
    setEditCoverImage(project.coverImage || null);
    setEditGalleryImages(project.screenshots || []);
    setEditTechTags(project.techStack || []);
    setEditTagInput('');
    setEditContributors(project.contributors?.length ? project.contributors.map(c => ({ name: c.name || '', role: c.role || '' })) : [{ name: '', role: '' }]);
    setEditCategory(project.category || 'Web Development');
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setIsEditing(false);
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

  const handleFormatMarkdown = (icon, isEditMode = true) => {
    const textareaId = isEditMode ? 'edit-overview' : 'project-overview';
    const textState = isEditMode ? editOverview : '';
    const setTextState = isEditMode ? setEditOverview : () => {};
    const textarea = document.getElementById(textareaId);
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textState.slice(start, end);

    let format = '';
    let selectionOffset = 0;
    
    if (icon === 'format_bold') {
      format = `**${selected || 'bold'}**`;
      selectionOffset = 2;
    } else if (icon === 'format_italic') {
      format = `*${selected || 'italic'}*`;
      selectionOffset = 1;
    } else if (icon === 'format_list_bulleted') {
      format = `\n- ${selected || 'item'}`;
      selectionOffset = 3;
    } else if (icon === 'link') {
      const url = prompt('Enter URL:', 'https://');
      if (!url) return;
      format = `[${selected || 'link text'}](${url})`;
      selectionOffset = 1;
    }

    const newText = textState.slice(0, start) + format + textState.slice(end);
    setTextState(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + selectionOffset;
      const selectLength = selected ? selected.length : (icon === 'link' ? 9 : (icon === 'format_list_bulleted' ? 4 : (icon === 'format_italic' ? 6 : 4)));
      textarea.setSelectionRange(newCursorPos, newCursorPos + selectLength);
    }, 10);
  };

  const handleEditCoverChange = async (e) => {
    if (e.target.files?.[0]) {
      const processed = await processImage(e.target.files[0]);
      setSelectedImageForCrop(processed);
      setShowCropper(true);
    }
  };

  const handleEditGalleryChange = async (e) => {
    if (!e.target.files?.length) return;
    const newImgs = await Promise.all([...e.target.files].map(processImage));
    setEditGalleryImages(prev => [...prev, ...newImgs]);
    if (galleryRef.current) galleryRef.current.value = '';
  };

  const addEditTag = () => {
    const t = editTagInput.trim();
    if (t && !editTechTags.includes(t)) setEditTechTags([...editTechTags, t]);
    setEditTagInput('');
  };

  const removeEditTag = (tag) => setEditTechTags(editTechTags.filter(t => t !== tag));

  const addEditContributor = () => setEditContributors([...editContributors, { name: '', role: '' }]);
  const removeEditContributor = (i) => setEditContributors(editContributors.filter((_, idx) => idx !== i));
  const updateEditContributor = (i, field, val) => {
    const arr = [...editContributors]; arr[i][field] = val; setEditContributors(arr);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editOverview.trim() || editTechTags.length === 0 || !editImpact.trim()) {
      alert('Please fill in all required fields (Title, Overview, Tech Stack, Impact).');
      return;
    }
    setSaving(true);
    try {
      const formatUrl = (u) => (u && !/^https?:\/\//i.test(u)) ? `https://${u}` : u;
      const payload = {
        title: editTitle,
        teamName: editTeamName,
        description: editOverview,
        impact: editImpact,
        demoUrl: formatUrl(editDemoUrl),
        youtubeUrl: formatUrl(editYoutubeUrl),
        githubUrl: formatUrl(editGithubUrl),
        coverImage: editCoverImage,
        screenshots: editGalleryImages,
        techStack: editTechTags,
        contributors: editContributors.filter(c => c.name.trim()),
        category: editCategory,
      };
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await refetch();
        setIsEditing(false);
      } else {
        alert('Failed to save changes. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/');
      } else {
        alert('Failed to delete project. Please try again.');
      }
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return (
    <div className="bg-background text-on-background font-body-md">
      <Header />
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!project) return (
    <div className="bg-background text-on-background font-body-md">
      <Header />
      <div className="text-center pt-40 text-on-surface-variant">
        <h2 className="text-headline-lg font-headline-lg mb-6">Project not found</h2>
        <Link href="/" className="px-6 py-3 bg-primary text-on-primary rounded-xl font-label-md font-semibold hover:opacity-90 transition-all">← Back to Home</Link>
      </div>
    </div>
  );

  const hasLiked = user && Array.isArray(project.likes) && project.likes.some(l => l.toString() === (user.userId || user._id)?.toString());
  const likesCount = Array.isArray(project.likes) ? project.likes.length : 0;
  const allImages = [...(project.screenshots || [])].filter(Boolean);

  // ===================== EDIT MODE =====================
  if (isEditing) {
    return (
      <div className="bg-background text-on-background font-body-md">
        {showCropper && (
          <ImageCropper
            image={selectedImageForCrop}
            onComplete={(croppedImg) => {
              setEditCoverImage(croppedImg);
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
          <div className="mb-stack-lg text-center">
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Edit Project</h1>
            <p className="text-body-md text-on-surface-variant">Update your project details below</p>
          </div>

          <div className="glass-panel p-8 rounded-xl shadow-sm space-y-8">
            <form className="space-y-8" onSubmit={handleSaveEdit}>

              {/* Project Title */}
              <div className="space-y-2">
                <label className="text-label-sm font-label-sm text-on-surface uppercase tracking-wider" htmlFor="edit-title">
                  Project Title <span className="text-error">*</span>
                </label>
                <input
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-body-md transition-all"
                  id="edit-title" type="text" required
                  placeholder="e.g. Autonomous Drone Navigation System"
                  value={editTitle} onChange={e => setEditTitle(e.target.value)}
                />
              </div>

              {/* Team Name */}
              <div className="space-y-2">
                <label className="text-label-sm font-label-sm text-on-surface uppercase tracking-wider" htmlFor="edit-team-name">
                  Team Name <span className="text-on-surface-variant normal-case">(Optional)</span>
                </label>
                <input
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-body-md transition-all"
                  id="edit-team-name" type="text"
                  placeholder="e.g. Cyber Squad (Leave blank to use your name)"
                  value={editTeamName} onChange={e => setEditTeamName(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-label-sm font-label-sm text-on-surface uppercase tracking-wider">Category</label>
                <select
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-body-md transition-all"
                  value={editCategory} onChange={e => setEditCategory(e.target.value)}
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
                  {editCoverImage ? (
                    <div className="relative w-full h-full">
                      <img src={editCoverImage} alt="Cover" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setEditCoverImage(null); if (coverRef.current) coverRef.current.value = ''; }}
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
                      <input className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" type="file" accept="image/*" onChange={handleEditCoverChange} ref={coverRef} />
                    </>
                  )}
                </div>
              </div>

              {/* Project Overview */}
              <div className="space-y-2">
                <label className="text-label-sm font-label-sm text-on-surface uppercase tracking-wider" htmlFor="edit-overview">
                  Project Overview <span className="text-error">*</span>
                </label>
                <div className="border border-outline-variant/30 rounded-lg overflow-hidden bg-surface-container-lowest">
                  <div className="flex gap-2 p-2 border-b border-outline-variant/30 bg-surface-container-low">
                    {['format_bold', 'format_italic', 'format_list_bulleted', 'link'].map(icon => (
                      <button key={icon} type="button" onClick={() => handleFormatMarkdown(icon, true)} className="p-1 hover:bg-surface-container-highest rounded transition-colors">
                        <span className="material-symbols-outlined text-sm">{icon}</span>
                      </button>
                    ))}
                  </div>
                  <textarea
                    className="w-full px-4 py-3 border-none focus:ring-0 text-body-md"
                    id="edit-overview"
                    placeholder="Describe the problem, your solution, and the key features..."
                    rows="6"
                    required
                    value={editOverview}
                    onChange={e => setEditOverview(e.target.value)}
                  />
                </div>
              </div>

              {/* Tech Stack & Tools */}
              <div className="space-y-2">
                <label className="text-label-sm font-label-sm text-on-surface uppercase tracking-wider">
                  Tech Stack &amp; Tools <span className="text-error">*</span>
                </label>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editTechTags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-highest text-on-surface-variant rounded-full text-label-md font-label-md">
                        {tag}
                        <button type="button" onClick={() => removeEditTag(tag)} className="hover:text-error">
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="relative">
                    <input
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-body-md pr-12 transition-all"
                      placeholder="Add a tool (e.g. AWS, Docker, PyTorch) and press Enter"
                      type="text"
                      value={editTagInput}
                      onChange={e => setEditTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEditTag(); } }}
                    />
                    <button
                      type="button" onClick={addEditTag}
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
                  {editGalleryImages.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                      <img src={src} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditGalleryImages(editGalleryImages.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/80"
                      >✕</button>
                    </div>
                  ))}
                  <div className="aspect-square bg-surface-container-low border-2 border-dashed border-outline-variant/50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container transition-all group relative overflow-hidden">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary">add_photo_alternate</span>
                    <span className="text-[10px] mt-1 font-label-sm text-on-surface-variant">Add Media</span>
                    <input className="absolute inset-0 opacity-0 cursor-pointer" type="file" accept="image/*" multiple onChange={handleEditGalleryChange} ref={galleryRef} />
                  </div>
                </div>
              </div>

              {/* Project Impact */}
              <div className="space-y-2">
                <label className="text-label-sm font-label-sm text-on-surface uppercase tracking-wider" htmlFor="edit-impact">
                  Project Impact <span className="text-error">*</span>
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-body-md transition-all"
                  id="edit-impact"
                  placeholder="What difference did this project make? Any metrics or specific outcomes?"
                  rows="4"
                  required
                  value={editImpact}
                  onChange={e => setEditImpact(e.target.value)}
                />
              </div>

              {/* Links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-label-sm font-label-sm text-on-surface uppercase tracking-wider" htmlFor="edit-demo-url">Website URL</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">language</span>
                    <input className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-body-md transition-all" id="edit-demo-url" type="text" placeholder="https://..." value={editDemoUrl} onChange={e => setEditDemoUrl(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-label-sm font-label-sm text-on-surface uppercase tracking-wider" htmlFor="edit-youtube-url">YouTube Video URL</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">smart_display</span>
                    <input className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-body-md transition-all" id="edit-youtube-url" type="text" placeholder="youtube.com/watch?v=..." value={editYoutubeUrl} onChange={e => setEditYoutubeUrl(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-label-sm font-label-sm text-on-surface uppercase tracking-wider" htmlFor="edit-github-url">GitHub Repository</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">code</span>
                    <input className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-body-md transition-all" id="edit-github-url" type="text" placeholder="github.com/user/repo" value={editGithubUrl} onChange={e => setEditGithubUrl(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Contributors */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-label-sm font-label-sm text-on-surface uppercase tracking-wider">Contributors</label>
                  <button type="button" onClick={addEditContributor} className="text-secondary text-label-sm font-label-sm hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">person_add</span> Add Contributor
                  </button>
                </div>
                <div className="space-y-3">
                  {editContributors.map((c, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-surface-container-low rounded-lg border border-outline-variant/20 items-end">
                      <div className="flex-1 space-y-2">
                        <label className="text-[10px] text-on-surface-variant uppercase font-semibold">Full Name</label>
                        <input
                          className="w-full bg-surface-container-lowest border-none p-0 text-body-md focus:ring-0"
                          type="text" placeholder="Jane Doe"
                          value={c.name} onChange={e => updateEditContributor(i, 'name', e.target.value)}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className="text-[10px] text-on-surface-variant uppercase font-semibold">Role</label>
                        <input
                          className="w-full bg-surface-container-lowest border-none p-0 text-body-md focus:ring-0"
                          type="text" placeholder="Lead Developer"
                          value={c.role} onChange={e => updateEditContributor(i, 'role', e.target.value)}
                        />
                      </div>
                      <button type="button" onClick={() => removeEditContributor(i)} className="p-2 text-on-surface-variant hover:text-error transition-colors">
                        <span className="material-symbols-outlined">delete_outline</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-8 flex flex-col md:flex-row gap-4 border-t border-outline-variant/20">
                <button
                  type="submit" disabled={saving}
                  className="flex-1 py-4 bg-primary text-on-primary font-headline-md text-headline-md rounded-xl hover:bg-primary-container transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70"
                >
                  {saving ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  ) : 'Save Changes'}
                </button>
                <button type="button" onClick={cancelEditing} className="px-10 py-4 bg-surface-container-highest text-on-surface font-headline-md text-headline-md rounded-xl hover:bg-outline-variant/40 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // ===================== VIEW MODE =====================
  return (
    <div className="bg-background text-on-background font-body-md">
      <Header />

      {/* Delete Comment Confirmation Modal */}
      {commentToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-[32px]">delete</span>
              </div>
              <h3 className="text-headline-md font-headline-md text-on-surface mb-2">Delete Comment?</h3>
              <p className="text-body-md text-on-surface-variant mb-6">
                Are you sure you want to delete this comment? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCommentToDelete(null)}
                  disabled={deletingComment}
                  className="flex-1 py-3 bg-surface-container-highest text-on-surface font-label-md font-semibold rounded-xl hover:bg-outline-variant/40 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteComment}
                  disabled={deletingComment}
                  className="flex-1 py-3 bg-error text-white font-label-md font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {deletingComment ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-[32px]">warning</span>
              </div>
              <h3 className="text-headline-md font-headline-md text-on-surface mb-2">Delete Project?</h3>
              <p className="text-body-md text-on-surface-variant mb-6">
                This action cannot be undone. The project <strong>"{project.title}"</strong> and all its data (comments, likes) will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 py-3 bg-surface-container-highest text-on-surface font-label-md font-semibold rounded-xl hover:bg-outline-variant/40 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 bg-error text-white font-label-md font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                      Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="pt-24 pb-stack-xl px-margin-x max-w-container-max mx-auto">

        {/* === Top Action Bar === */}
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between items-start sm:items-center mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg font-label-md font-semibold transition-all">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back
          </Link>

          {isOwner && (
            <div className="flex gap-3">
              <button
                onClick={startEditing}
              className="flex items-center gap-1.5 px-4 py-2 bg-surface-container-high text-on-surface rounded-lg text-label-md font-label-md font-semibold hover:bg-surface-container transition-all border border-outline-variant/30 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Project
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-error-container text-on-error-container rounded-lg text-label-md font-label-md font-semibold hover:opacity-80 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Delete
            </button>
            </div>
          )}
        </div>

        {/* === HERO: 12-col grid === */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-stack-xl animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* Left: tall portrait card — col-span-5 */}
          <div className="lg:col-span-5 relative group overflow-hidden rounded-[2rem] h-[350px] sm:h-[450px] lg:h-[550px] shadow-2xl">
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
            <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                {project.category && (
                  <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-white text-[10px] sm:text-label-sm font-label-sm">
                    {project.category}
                  </span>
                )}
              </div>
              <h1 className="text-white font-display text-xl sm:text-2xl md:text-headline-lg leading-tight mb-2 line-clamp-4 md:line-clamp-none">{project.title}</h1>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-white/20">
                <span className="text-white/80 text-xs sm:text-label-md font-label-md">By {project.teamName || project.studentName}</span>
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-1.5 sm:gap-2 text-xs sm:text-base ${isLiking ? 'opacity-70' : ''} ${hasLiked ? 'bg-[#ef4444] text-white shadow-lg shadow-red-500/20' : 'bg-white text-primary'}`}
                >
                  <span className="material-symbols-outlined text-[16px] sm:text-[20px]" style={{ fontVariationSettings: hasLiked ? '"FILL" 1' : '"FILL" 0' }}>favorite</span>
                  <span>{hasLiked ? 'Liked' : 'Like'}</span>
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
            <div className="p-5 sm:p-8 glass-card rounded-3xl">
              <h2 className="text-headline-lg font-headline-lg mb-4">Project Overview</h2>
              <div className="text-body-md text-on-surface-variant markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkBreaks]}
                  components={{
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li className="text-on-surface-variant" {...props} />,
                    a: ({node, ...props}) => <a className="text-secondary hover:underline font-semibold" target="_blank" rel="noopener noreferrer" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-on-surface" {...props} />,
                    em: ({node, ...props}) => <em className="italic" {...props} />
                  }}
                >
                  {project.description}
                </ReactMarkdown>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {project.demoUrl && (
                <a
                  href={project.demoUrl} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 transition-all"
                >
                  <span className="material-symbols-outlined">language</span>
                  Website
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
        {(project.impact || project.youtubeUrl) && (
          <section className="mb-stack-xl">
            <div className="max-w-container-max mx-auto space-y-stack-lg">
              {project.impact && (
                <div className="space-y-stack-md text-left">
                  <h2 className="text-headline-lg font-headline-lg">Project Impact</h2>
                  <div className="prose prose-slate max-w-none text-body-lg text-on-surface-variant">
                    <p>{project.impact}</p>
                  </div>
                </div>
              )}
              {project.youtubeUrl && getYoutubeVideoId(project.youtubeUrl) && (
                <div className="flex flex-col lg:flex-row gap-8 items-center mt-6">
                  <div className="w-full lg:w-2/3 max-w-2xl aspect-video rounded-xl overflow-hidden shadow-lg border border-outline-variant/30 text-left">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${getYoutubeVideoId(project.youtubeUrl)}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="w-full flex-1 text-left">
                    <ScrambledText
                      radius={100}
                      duration={1.2}
                      speed={0.5}
                      scrambleChars=".:"
                    >
                      <h2 className="text-3xl lg:text-headline-lg font-headline-lg mb-4 md:mb-6">Project Walkthrough</h2>
                      <p className="text-lg lg:text-2xl text-on-surface-variant leading-relaxed">Watch the video presentation to see this project in action . . .</p>
                    </ScrambledText>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* === IMAGE CAROUSEL === */}
        {allImages.length > 0 && (
          <section className="mb-stack-xl">
            <div className="max-w-container-max mx-auto space-y-stack-lg">
              <div className="relative group">
                {/* Nav arrows */}
                <div className="hidden md:flex items-center justify-between absolute w-full top-1/2 -translate-y-1/2 z-10 pointer-events-none px-4">
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
                    <div key={i} className="flex-none h-[300px] md:h-[450px] snap-start">
                      <div className="bg-surface-container rounded-3xl p-4 md:p-6 h-full inline-flex items-center justify-center">
                        <img
                          className="h-full w-auto object-contain rounded-2xl shadow-sm"
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
          <div className="bg-surface-container-lowest rounded-3xl p-5 sm:p-10 border border-primary/5">
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
                  <button type="submit" disabled={isPostingComment} className="px-6 py-2.5 bg-primary text-on-primary text-label-md font-label-md font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center ml-auto gap-2">
                    {isPostingComment && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {isPostingComment ? 'Posting...' : 'Post Comment'}
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

            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4">
              {project.comments?.length ? project.comments.map((c, i) => (
                <div key={i} className="flex gap-4 pb-6 border-b border-surface-container-high last:border-0">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-headline-md font-bold flex-shrink-0">
                    {c.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-body-md font-semibold text-on-surface">{c.userName}</span>
                      <span className="font-label-sm text-on-surface-variant flex-1">{new Date(c.createdAt).toLocaleDateString()}</span>
                      {user && (user.userId || user._id)?.toString() === c.user?.toString() && (
                        <button
                          onClick={() => setCommentToDelete(c)}
                          className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error/10 ml-2 flex items-center justify-center"
                          title="Delete comment"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      )}
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
              <span className="text-headline-md font-headline-md font-bold text-primary">BuildFolio</span>
              <p className="text-body-md font-body-md text-on-surface-variant">© 2024-28 CS-A. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-stack-lg" />
          </div>
        </div>
      </footer>
    </div>
  );
}
