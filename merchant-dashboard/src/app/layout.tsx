// src/app/layout.tsx
import '../styles/globals.css';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export const metadata = {
  title: 'Senku Loyalty Dashboard',
  description: 'Dashboard para la gestión de programas de lealtad'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f4f5' }}>
          <Sidebar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Header title="Senku Loyalty" />
            <main style={{ padding: '2rem' }}>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
