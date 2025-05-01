'use client';

import styles from '../styles/ChartPlaceholder.module.css';

export default function ChartPlaceholder() {
  return (
    <div className={styles.chartContainer}>
      <p className={styles.chartTitle}>Actividad Reciente</p>
      <div className={styles.chartBox}>
        <span className={styles.chartText}>[ Gráfico aquí próximamente ]</span>
      </div>
    </div>
  );
}
