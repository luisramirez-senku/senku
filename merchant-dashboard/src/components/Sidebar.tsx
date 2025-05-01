'use client';

import { useState } from 'react';
import styles from '../styles/Sidebar.module.css';
import { FiHome, FiTarget, FiGift, FiUsers, FiSettings } from 'react-icons/fi';
import Link from 'next/link';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.topSection}>
        {isOpen && <h1 className={styles.logo}>Senku Loyalty</h1>}
        <button onClick={toggleSidebar} className={styles.hamburger}>
          ☰
        </button>
      </div>
      <nav className={styles.nav}>
        <ul>
        <li>
            <Link href="/" className={styles.link}>
                <FiHome className={styles.icon} />
                {isOpen && <span>Inicio</span>}
            </Link>
            </li>
            <li>
            <Link href="/programs" className={styles.link}>
                <FiTarget className={styles.icon} />
                {isOpen && <span>Programas</span>}
            </Link>
            </li>
            <li>
            <Link href="/rewards" className={styles.link}>
                <FiGift className={styles.icon} />
                {isOpen && <span>Recompensas</span>}
            </Link>
            </li>
            <li>
            <Link href="/customers" className={styles.link}>
                <FiUsers className={styles.icon} />
                {isOpen && <span>Clientes</span>}
            </Link>
            </li>
            <li>
            <Link href="/settings" className={styles.link}>
                <FiSettings className={styles.icon} />
                {isOpen && <span>Configuración</span>}
            </Link>
            </li>

        </ul>
      </nav>
    </aside>
  );
}
