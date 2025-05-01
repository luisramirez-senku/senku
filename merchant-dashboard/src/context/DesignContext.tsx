'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface DesignContextType {
  programName: string;
  backgroundColor: string;
  foregroundColor: string;
  logoUrl: string;
  iconUrl: string;
  heroImageUrl?: string;
  description: string;
  barcodeValue: string;
  status: 'active' | 'inactive';
  setProgramName: (name: string) => void;
  setBackgroundColor: (color: string) => void;
  setForegroundColor: (color: string) => void;
  setLogoUrl: (url: string) => void;
  setIconUrl: (url: string) => void;
  setHeroImageUrl: (url: string) => void;
  setDescription: (desc: string) => void;
  setBarcodeValue: (code: string) => void;
  setStatus: (status: 'active' | 'inactive') => void;
}

const DesignContext = createContext<DesignContextType | undefined>(undefined);

export function DesignProvider({ children }: { children: ReactNode }) {
  const [programName, setProgramName] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [logoUrl, setLogoUrl] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [barcodeValue, setBarcodeValue] = useState('standard');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  return (
    <DesignContext.Provider
      value={{
        programName,
        backgroundColor,
        foregroundColor,
        logoUrl,
        iconUrl,
        heroImageUrl,
        description,
        barcodeValue,
        status,
        setProgramName,
        setBackgroundColor,
        setForegroundColor,
        setLogoUrl,
        setIconUrl,
        setHeroImageUrl,
        setDescription,
        setBarcodeValue,
        setStatus,
      }}
    >
      {children}
    </DesignContext.Provider>
  );
}

export function useDesignContext() {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error('useDesignContext must be used within a DesignProvider');
  }
  return context;
}
