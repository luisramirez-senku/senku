'use client';

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

type ProgramType = 'points' | 'cashback' | 'stamps';

interface ProgramCreationContextType {
  programType: ProgramType | null;
  setProgramType: Dispatch<SetStateAction<ProgramType | null>>;
}

export const ProgramCreationContext = createContext<ProgramCreationContextType | undefined>(undefined);

export function ProgramCreationProvider({ children }: { children: ReactNode }) {
  const [programType, setProgramType] = useState<ProgramType | null>(null);

  return (
    <ProgramCreationContext.Provider value={{ programType, setProgramType }}>
      {children}
    </ProgramCreationContext.Provider>
  );
}

// 💥 Aquí estaba faltando el hook:
export function useProgramCreationContext() {
  const context = useContext(ProgramCreationContext);
  if (!context) {
    throw new Error('useProgramCreationContext must be used within a ProgramCreationProvider');
  }
  return context;
}
