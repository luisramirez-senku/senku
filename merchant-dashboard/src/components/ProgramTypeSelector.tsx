'use client';

import styles from '../styles/ProgramTypeSelector.module.css';
import { FiStar, FiDollarSign, FiGift } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useProgramCreationStore } from '../store/useProgramCreationStore';
import { JSX } from 'react';

interface ProgramOption {
  key: 'points' | 'cashback' | 'stamps';
  label: string;
  description: string;
  icon: JSX.Element;
}

const options: ProgramOption[] = [
  { key: 'points', label: 'Puntos', description: 'Acumula puntos y canjea por premios', icon: <FiStar size={32} /> },
  { key: 'cashback', label: 'Cashback', description: 'Devolución en efectivo sobre compras', icon: <FiDollarSign size={32} /> },
  { key: 'stamps', label: 'Sellos', description: 'Completa sellos para obtener recompensas', icon: <FiGift size={32} /> },
];

export default function ProgramTypeSelector() {
  const setProgramType = useProgramCreationStore((state) => state.setProgramType);
  const router = useRouter();

  const handleSelect = (key: 'points' | 'cashback' | 'stamps') => {
    setProgramType(key);
    router.push('/programs/create/configuration'); // ✅ Redirección al paso correcto
  };

  return (
    <div className={styles.container}>
      <div className={styles.stepper}>
        <div className={`${styles.step} ${styles.active}`}>1. Tipo de programa</div>
        <div className={styles.step}>2. Configuración</div>
        <div className={styles.step}>3. Diseño</div>
        <div className={styles.step}>4. Información final</div>
      </div>

      <h2 className={styles.title}>Selecciona el tipo de programa</h2>

      <div className={styles.options}>
        {options.map((option) => (
          <div
            key={option.key}
            className={styles.card}
            onClick={() => handleSelect(option.key)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.icon}>{option.icon}</div>
            <h3 className={styles.label}>{option.label}</h3>
            <p className={styles.description}>{option.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
