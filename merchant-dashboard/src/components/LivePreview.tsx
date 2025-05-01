// src/components/LivePreview.tsx
'use client';

import { useDesignContext } from '../context/DesignContext';
import styles from '../styles/LivePreview.module.css';

export default function LivePreview() {
  const {
    programName,
    description,
    backgroundColor,
    foregroundColor,
    barcodeValue
  } = useDesignContext();

  return (
    <div className={styles.mockupContainer}>
      <div className={styles.notch}></div>
      <div className={styles.buttonSide}></div>
      <div
        className={styles.card}
        style={{ backgroundColor, color: foregroundColor }}
      >
        <h3 className={styles.programName}>{programName || 'Nombre del Programa'}</h3>
        <p className={styles.description}>{description || 'Descripción del programa'}</p>
        <div className={styles.barcode}>{barcodeValue || '1234567890'}</div>
      </div>
    </div>
  );
}
