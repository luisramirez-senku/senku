import { ProgramCreationProvider } from '../../../context/ProgramCreationContext';
import { DesignProvider } from '../../../context/DesignContext';


export default function ProgramCreateLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProgramCreationProvider>
      <DesignProvider>
        {children}
      </DesignProvider>
    </ProgramCreationProvider>
  );
}

