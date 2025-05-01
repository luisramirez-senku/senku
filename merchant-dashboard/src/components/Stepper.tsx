'use client';

import styles from '../styles/Stepper.module.css';

interface StepperProps {
  currentStep: number;
}

const steps = ['Tipo de programa', 'Configuración', 'Diseño', 'Información final'];

export default function Stepper({ currentStep }: StepperProps) {
  return (
    <div className={styles.stepper}>
      {steps.map((step, index) => (
        <div
          key={index}
          className={`${styles.step} ${currentStep === index + 1 ? styles.active : ''}`}
        >
          {index + 1}. {step}
        </div>
      ))}
    </div>
  );
}
