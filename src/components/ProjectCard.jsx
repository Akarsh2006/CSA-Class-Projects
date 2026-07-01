'use client';

import Link from 'next/link';
import styles from './ProjectCard.module.css';

export default function ProjectCard({ project }) {
  const date = new Date(project.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Link href={`/project/${project._id}`} className={`${styles.card} glass fade-in`}>
      <div className={styles.imageContainer}>
        {project.coverImage ? (
          <img src={project.coverImage} alt={project.title} className={styles.image} />
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon}>🖼️</span>
          </div>
        )}
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{project.title}</h3>
        
        <div className={styles.meta}>
          <div className={styles.studentInfo}>
            <span className={styles.avatar}>{project.studentName.charAt(0).toUpperCase()}</span>
            <span className={styles.studentName}>{project.studentName}</span>
          </div>
          
          <div className={styles.stats}>
            <span className={styles.date}>{date}</span>
            <div className={styles.likes}>
              <span className={styles.heart}>❤️</span>
              <span className={styles.likeCount}>{project.likes?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
