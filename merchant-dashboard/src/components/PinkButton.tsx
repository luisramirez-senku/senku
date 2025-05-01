// src/components/PinkButton.tsx
'use client';

import styles from '../styles/PinkButton.module.css';

interface PinkButtonProps {
  text: string;
  onClick: () => void;
}

export default function PinkButton({ text, onClick }: PinkButtonProps) {
  return (
    <button className={styles.pinkButton} onClick={onClick}>
      {text}
    </button>
  );
}
