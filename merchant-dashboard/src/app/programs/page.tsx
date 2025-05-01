'use client';

import { useRouter } from 'next/navigation';
import ProgramCard from '../../components/ProgramCard';
import styles from '../../styles/ProgramsPage.module.css';

interface Program {
  id: string;
  name: string;
  type: 'points' | 'cashback' | 'stamps';
  active: boolean;
}

export default function ProgramsPage() {
  const router = useRouter();
  const programs: Program[] = []; // ← Aquí luego se conectará al backend

  const handleCreateProgram = () => {
    router.push('/programs/create');
  };

  return (
    <div className={styles.programsPage}>
      <h1 className={styles.title}>PROGRAMAS DE LEALTAD</h1>
      <div className={styles.cardsContainer}>
        {/* Tarjeta para crear programa */}
        <div className={`${styles.card} ${styles.createCard}`}>
          <div className={styles.mockupEmpty}>
            <span>＋</span>
          </div>
          <p className={styles.programName}>Crear Programa</p>
          <button onClick={handleCreateProgram} className={styles.createButton}>
            Crear Programa
          </button>
        </div>

        {/* Programas existentes */}
        {programs.map((program) => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </div>
    </div>
  );
}
