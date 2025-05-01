'use client';

import ProgramTypeSelector from '../../../components/ProgramTypeSelector';
import { ProgramCreationProvider } from '../../../context/ProgramCreationContext';

export default function ProgramCreatePage() {
  return (
    <ProgramCreationProvider>
      <ProgramTypeSelector />
    </ProgramCreationProvider>
  );
}
