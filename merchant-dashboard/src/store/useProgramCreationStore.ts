import { create } from 'zustand';

type ProgramType = 'points' | 'cashback' | 'stamps';

interface ProgramCreationState {
  programType: ProgramType | null;
  setProgramType: (type: ProgramType) => void;
}

export const useProgramCreationStore = create<ProgramCreationState>((set) => ({
  programType: null,
  setProgramType: (type) => set({ programType: type }),
}));
