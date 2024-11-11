import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/NavBar';

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
      <body>
        {children}
      </body>
    </html>
  );
}
