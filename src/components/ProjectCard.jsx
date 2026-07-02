'use client';

import Link from 'next/link';

export default function ProjectCard({ project }) {
  const date = new Date(project.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
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
        {/* Author row + Like button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-headline-md font-headline-md">{project.studentName}</h3>
          </div>
          <button
            className="bg-white/90 text-black px-6 py-2 rounded-full text-label-md font-label-md font-bold hover:bg-white transition-all card-blur flex items-center gap-1"
            onClick={e => e.preventDefault()}
          >
            <span className="material-symbols-outlined text-[16px]">favorite</span>
            Like
            <span className="text-label-sm ml-1">{likesCount}</span>
          </button>
        </div>

        {/* Title as description */}
        <p className="text-body-md font-body-md text-white/90 leading-relaxed line-clamp-2">
          {project.title}
        </p>

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
