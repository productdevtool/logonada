import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { googleFonts } from '@/lib/fonts';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Logonada',
  description: 'Create your custom brand identity with an intuitive logo maker.',
};

function getGoogleFontUrl() {
  const familyParams = googleFonts.map(font => {
    const fontName = font.family.split(',')[0].replace(/'/g, '').replace(/\s/g, '+');
    const weights = font.weights.join(';');
    return `family=${fontName}:wght@${weights}`;
  }).join('&');
  return `https://fonts.googleapis.com/css2?${familyParams}&display=swap`;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={getGoogleFontUrl()} rel="stylesheet" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
