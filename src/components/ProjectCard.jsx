'use client';

import Link from 'next/link';

export default function ProjectCard({ project }) {
  const date = new Date(project.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const likesCount = Array.isArray(project.likes) ? project.likes.length : (project.likesCount || 0);

  return (
    <Link href={`/project/${project._id}`} className="project-card">
      {project.coverImage ? (
        <img src={project.coverImage} alt={project.title} />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #dae2fd 0%, #bec6e0 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '64px', opacity: 0.5
        }}>📁</div>
      )}

      <div className="project-card-gradient" />

      <div className="project-card-content">
        <div className="project-card-top">
          <div className="project-card-author">
            <h3>{project.studentName}</h3>
          </div>
          <div className="project-card-like-btn" onClick={(e) => e.preventDefault()}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: '"FILL" 1' }}>favorite</span>
            Like
            <span style={{ fontSize: '12px', marginLeft: '4px', opacity: 0.7 }}>{likesCount}</span>
          </div>
        </div>

        <p className="project-card-description">{project.title}</p>

        <div className="project-card-meta">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_today</span>
          <span>{date}</span>
        </div>
      </div>
    </Link>
  );
}
