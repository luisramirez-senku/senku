'use client';

import { ReactNode } from 'react';
import styles from '../styles/MainContent.module.css';

interface MainContentProps {
  children: ReactNode;
}

export default function MainContent({ children }: MainContentProps) {
  return <main className={styles.main}>{children}</main>;
}
