'use client';

import styles from '../styles/RecentActivity.module.css';

export default function RecentActivity() {
  const activities = [
    { id: 1, action: 'Cliente Juan Pérez redimió 200 puntos', date: '2025-04-23' },
    { id: 2, action: 'Nuevo cliente registrado: María López', date: '2025-04-23' },
    { id: 3, action: 'Se acreditaron 500 puntos a Carlos Jiménez', date: '2025-04-22' },
  ];

  return (
    <div className={styles.activityContainer}>
      <p className={styles.activityTitle}>Actividad Reciente</p>
      <ul className={styles.activityList}>
        {activities.map((activity) => (
          <li key={activity.id} className={styles.activityItem}>
            <span>{activity.action}</span>
            <span className={styles.activityDate}>{activity.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
