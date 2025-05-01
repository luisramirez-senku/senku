'use client';

import { useRouter } from 'next/navigation';
import { useDesignContext } from '../../../../context/DesignContext';
import styles from '../../../../styles/ProgramDesignForm.module.css';
import LivePreview from '../../../../components/LivePreview';
import { uploadFile } from '../../../../services/uploadService';
import Stepper from '../../../../components/Stepper';
import PinkButton from '../../../../components/PinkButton';

export default function ProgramDesignPage() {
  const router = useRouter();
  const {
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
    setStatus
  } = useDesignContext();

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const uploadedUrl = await uploadFile(file);
        setter(uploadedUrl);
      } catch (error) {
        console.error('Error al subir la imagen:', error);
      }
    }
  };

  const handleNext = () => {
    router.push('/programs/create/final');
  };

  return (
    <div className={styles.container}>
      <div className={styles.formSection}>
        <Stepper currentStep={3} />
        <h1 className={styles.title}>Diseño de la Tarjeta</h1>
        <form className={styles.form}>
          <div className={styles.field}>
            <label>Nombre del programa</label>
            <input
              type="text"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Descripción corta</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Color de fondo</label>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Color del texto</label>
            <input
              type="color"
              value={foregroundColor}
              onChange={(e) => setForegroundColor(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Logo del negocio (upload)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, setLogoUrl)}
            />
            {logoUrl && <p className={styles.uploadedText}>Logo cargado ✅</p>}
          </div>

          <div className={styles.field}>
            <label>Ícono de la tarjeta (upload)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, setIconUrl)}
            />
            {iconUrl && <p className={styles.uploadedText}>Ícono cargado ✅</p>}
          </div>

          <div className={styles.field}>
            <label>Imagen hero (opcional, upload)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, setHeroImageUrl)}
            />
            {heroImageUrl && <p className={styles.uploadedText}>Imagen hero cargada ✅</p>}
          </div>

          <div className={styles.field}>
            <label>Valor del código de barras / QR</label>
            <input
              type="text"
              value={barcodeValue}
              onChange={(e) => setBarcodeValue(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Estado del programa</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>

          <PinkButton text="Continuar →" onClick={handleNext} />
        </form>
      </div>

      <div className={styles.previewSection}>
        <LivePreview />
      </div>
    </div>
  );
}
