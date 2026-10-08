import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'UNIR · Ponentes', description: 'Directorio interno de ponentes y expertos' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body>{children}</body></html>; }
