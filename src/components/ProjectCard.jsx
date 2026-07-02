'use client';

import Link from 'next/link';

export default function ProjectCard({ project, user }) {
  const date = new Date(project.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const hasLiked = user && Array.isArray(project.likes) && project.likes.some(l => l.toString() === (user.userId || user._id)?.toString());
  const likesCount = Array.isArray(project.likes) ? project.likes.length : (project.likesCount || 0);

  return (
    <Link
      href={`/project/${project._id}`}
      className="group relative aspect-[4/5] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-outline-variant/10 block"
    >
      {project.coverImage ? (
        <img
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          src={project.coverImage}
          alt={project.title}
        />
      ) : (
        <div className="absolute inset-0 bg-surface-container-highest flex items-center justify-center text-6xl opacity-40">📁</div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Card content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white space-y-stack-sm">
        {/* Title and Author + Like button */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-headline-md font-headline-md font-bold leading-snug line-clamp-2">{project.title}</h3>
            <p className="text-body-md font-body-md text-white/90">
              By {project.teamName || project.studentName}
            </p>
          </div>
          <button
            className={`px-4 py-2 rounded-full text-label-md font-label-md font-bold transition-all card-blur flex-shrink-0 flex items-center gap-1 ${hasLiked ? 'bg-[#ef4444] text-white shadow-lg shadow-red-500/20' : 'bg-white/90 text-black hover:bg-white'}`}
            onClick={e => e.preventDefault()}
          >
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: hasLiked ? '"FILL" 1' : '"FILL" 0' }}>favorite</span>
            <span className="text-label-sm">{likesCount}</span>
          </button>
        </div>

        {/* Date */}
        <div className="flex items-center gap-6 pt-4 text-label-md font-label-md text-white/80">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            <span>{date}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
