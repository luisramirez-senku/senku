'use client';

import { useState } from 'react';
import styles from '../styles/DesignForm.module.css';

export default function DesignForm() {
  const [formData, setFormData] = useState({
    backgroundColor: '#1A73E8', // Azul default
    textColor: '#FFFFFF',
    logoUrl: '',
    bannerUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Aquí deberías actualizar el preview con algún context o estado global
  };

  return (
    <form className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="backgroundColor">Color de Fondo</label>
        <input
          type="color"
          id="backgroundColor"
          name="backgroundColor"
          value={formData.backgroundColor}
          onChange={handleChange}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="textColor">Color del Texto</label>
        <input
          type="color"
          id="textColor"
          name="textColor"
          value={formData.textColor}
          onChange={handleChange}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="logoUrl">Logo URL</label>
        <input
          type="text"
          id="logoUrl"
          name="logoUrl"
          placeholder="https://ejemplo.com/logo.png"
          value={formData.logoUrl}
          onChange={handleChange}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="bannerUrl">Banner URL</label>
        <input
          type="text"
          id="bannerUrl"
          name="bannerUrl"
          placeholder="https://ejemplo.com/banner.png"
          value={formData.bannerUrl}
          onChange={handleChange}
        />
      </div>
    </form>
  );
}
