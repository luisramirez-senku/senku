'use client';

import { useProgramCreationStore } from '../../../../store/useProgramCreationStore';
import { useDesignContext } from '../../../../context/DesignContext';
import Stepper from '../../../../components/Stepper';
import PinkButton from '../../../../components/PinkButton';
import LivePreview from '../../../../components/LivePreview';
import styles from '../../../../styles/ProgramFinalPage.module.css';
import { useRouter } from 'next/navigation';

export default function ProgramFinalPage() {
  const programType = useProgramCreationStore((state) => state.programType);
  const {
    programName,
    backgroundColor,
    foregroundColor,
    logoUrl,
    iconUrl,
    heroImageUrl,
    description,
    barcodeValue,
    status
  } = useDesignContext();

  const router = useRouter();

  const handleSave = () => {
    // Aquí conectás con el backend para guardar la info del programa
    console.log('Datos del programa:', {
      programType,
      programName,
      backgroundColor,
      foregroundColor,
      logoUrl,
      iconUrl,
      heroImageUrl,
      description,
      barcodeValue,
      status
    });
    // Después de guardar, podés redirigir al listado de programas:
    router.push('/programs');
  };

  if (!programType) {
    return <p>Tipo de programa no seleccionado. Por favor vuelve al paso anterior.</p>;
  }

  return (
    <div className={styles.container}>
      <Stepper currentStep={4} />
      <h1 className={styles.title}>Resumen Final del Programa</h1>
      <p className={styles.subtitle}>Revisa los datos antes de guardar tu programa.</p>

      <div className={styles.content}>
        <div className={styles.details}>
          <h2>Información del Programa</h2>
          <ul className={styles.list}>
            <li><strong>Tipo de Programa:</strong> {programType}</li>
            <li><strong>Nombre:</strong> {programName}</li>
            <li><strong>Descripción:</strong> {description}</li>
            <li><strong>Color de fondo:</strong> {backgroundColor}</li>
            <li><strong>Color del texto:</strong> {foregroundColor}</li>
            <li><strong>Estado:</strong> {status === 'active' ? 'Activo' : 'Inactivo'}</li>
          </ul>

          <PinkButton text="Guardar Programa" onClick={handleSave} />
        </div>

        <div className={styles.preview}>
          <LivePreview />
        </div>
      </div>
    </div>
  );
}
