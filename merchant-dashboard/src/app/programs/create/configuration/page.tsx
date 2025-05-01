'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProgramCreationStore } from '../../../../store/useProgramCreationStore';
import styles from '../../../../styles/ProgramConfiguration.module.css';
import Stepper from '../../../../components/Stepper';
import PinkButton from '../../../../components/PinkButton';

export default function ProgramConfigurationPage() {
  const programType = useProgramCreationStore((state) => state.programType);
  const router = useRouter();

  const [name, setName] = useState('');
  const [pointsPerAmount, setPointsPerAmount] = useState(1);
  const [cashbackPercentage, setCashbackPercentage] = useState(5);
  const [requiredStamps, setRequiredStamps] = useState(10);

  const handleNext = () => {
    // Aquí podrías agregar lógica de validación si querés, antes de hacer el push
    router.push('/programs/create/design');
  };

  if (!programType) {
    return <p>Tipo de programa no seleccionado. Por favor vuelve al paso anterior.</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Configuración del Programa</h1>

      <div className={styles.columns}>
        {/* Formulario */}
        <div className={styles.form}>
          <Stepper currentStep={2} />

          <div className={styles.field}>
            <label>Nombre del Programa:</label>
            <input
              type="text"
              placeholder="Ej. Club de Recompensas"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {programType === 'points' && (
            <div className={styles.field}>
              <label>Puntos por cada ₡1000 colones gastados:</label>
              <input
                type="number"
                value={pointsPerAmount}
                onChange={(e) => setPointsPerAmount(Number(e.target.value))}
              />
            </div>
          )}

          {programType === 'cashback' && (
            <div className={styles.field}>
              <label>Porcentaje de Cashback:</label>
              <input
                type="number"
                value={cashbackPercentage}
                onChange={(e) => setCashbackPercentage(Number(e.target.value))}
              />
            </div>
          )}

          {programType === 'stamps' && (
            <div className={styles.field}>
              <label>Sellos requeridos para obtener recompensa:</label>
              <input
                type="number"
                value={requiredStamps}
                onChange={(e) => setRequiredStamps(Number(e.target.value))}
              />
            </div>
          )}

          <PinkButton text="Continuar al diseño →" onClick={handleNext} />
        </div>

        {/* Placeholder del mockup */}
        <div className={styles.preview}>
          <h2 className={styles.previewTitle}>Vista previa del diseño (Mockup iPhone)</h2>
          <div className={styles.previewPlaceholder}>[Preview del diseño aquí]</div>
        </div>
      </div>
    </div>
  );
}
