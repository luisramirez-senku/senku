'use client';

import styles from '../styles/ProgramCard.module.css';

interface Program {
  id: string;
  name: string;
  type: 'points' | 'cashback' | 'stamps';
  active: boolean;
}

interface ProgramCardProps {
  program: Program;
}

export default function ProgramCard({ program }: ProgramCardProps) {
  return (
    <div
      className={`${styles.card} ${program.active ? styles.active : styles.inactive}`}
    >
      <div className={styles.mockup}>
        {/* Aquí luego podemos meter el preview del diseño o imagen */}
      </div>
      <p className={styles.programName}>{program.name}</p>
      <div className={styles.actions}>
        <button className={styles.editButton}>Editar</button>
        <button className={styles.secondaryButton}>Activar/Desactivar</button>
        <button className={styles.secondaryButton}>Duplicar</button>
        <button className={styles.secondaryButton}>Eliminar</button>
      </div>
    </div>
  );
}
