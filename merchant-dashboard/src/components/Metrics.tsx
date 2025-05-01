'use client';

import styles from '../styles/Metrics.module.css';

export default function Metrics() {
  return (
    <div className={styles.metricsContainer}>
      <div className={styles.metricCard}>
        <p className={styles.metricLabel}>Clientes Registrados</p>
        <p className={styles.metricValue}>1234</p>
      </div>
      <div className={styles.metricCard}>
        <p className={styles.metricLabel}>Puntos Canjeados</p>
        <p className={styles.metricValue}>56,789</p>
      </div>
      <div className={styles.metricCard}>
        <p className={styles.metricLabel}>Ingresos Generados</p>
        <p className={styles.metricValue}>$12,345</p>
      </div>
    </div>
  );
}
