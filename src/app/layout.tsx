import type { Metadata } from 'next';
import './globals.css';
import AbstractBackground from '@/components/AbstractBackground';

export const metadata: Metadata = {
  title: "Jeff's Website",
  description: 'An attempt at showing what I can build',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ background: '#0a0a0f' }}>
        <AbstractBackground />
        {children}
      </body>
    </html>
  );
}
