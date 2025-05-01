'use client';

import styles from '../styles/Header.module.css';
import { FiMenu } from 'react-icons/fi';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>{title}</h1>
      </div>
    </header>
  );
}
