import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'NetRunner - Web Security Simulator',
  description: 'Interactive web security training simulator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body>
        <Script
          src="https://cdn.tailwindcss.com"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}

