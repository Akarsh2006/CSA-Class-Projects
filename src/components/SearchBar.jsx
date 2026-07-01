'use client';

import styles from './SearchBar.module.css';

export default function SearchBar({ value, onSearch }) {
  return (
    <div className={styles.searchContainer}>
      <div className={`${styles.searchWrapper} glass`}>
        <span className={styles.icon}>🔍</span>
        <input
          type="text"
          className={styles.input}
          placeholder="Search projects by title or student..."
          value={value}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
}
