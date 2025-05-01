'use client';

import styles from '../styles/ProgramsOverview.module.css';

interface Program {
  id: string;
  title: string;
  imageUrl: string;
  isActive: boolean;
}

interface ProgramsOverviewProps {
  programs: Program[];
}

export default function ProgramsOverview({ programs }: ProgramsOverviewProps) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>PROGRAMAS DE LEALTAD</h1>

      <div className={styles.programsGrid}>
        {/* Si no hay programas, mostrar la tarjeta gris para crear programa */}
        {programs.length === 0 ? (
          <div className={styles.createCard}>
            <div className={styles.mockupPlaceholder}>
              <span className={styles.placeholderText}>[ MOCKUP TARJETA ]</span>
            </div>
            <button className={styles.createButton}>Crear Programa</button>
          </div>
        ) : (
          programs.map((program) => (
            <div
              key={program.id}
              className={`${styles.programCard} ${program.isActive ? styles.active : styles.inactive}`}
            >
              <img src={program.imageUrl} alt={program.title} className={styles.programImage} />
              <h2 className={styles.programTitle}>{program.title}</h2>
              <div className={styles.actions}>
                <button className={styles.editButton}>Editar</button>
                <button className={styles.actionButton}>Activar/Desactivar</button>
                <button className={styles.actionButton}>Duplicar</button>
                <button className={styles.actionButton}>Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
