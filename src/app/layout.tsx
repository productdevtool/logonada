import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Logonada',
  description: 'Create your custom brand identity with an intuitive logo maker.',
};

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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Lato:wght@400;700&family=Montserrat:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&family=Raleway:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;700&family=Lobster&family=Poppins:wght@400;500;600;700&family=Open+Sans:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&family=Ubuntu:wght@400;500;700&family=Source+Sans+Pro:wght@400;600;700&family=PT+Sans:wght@400;700&family=Dosis:wght@400;500;600;700&family=Exo+2:wght@400;500;600;700&family=Arvo:wght@400;700&family=Lora:wght@400;500;600;700&family=Pacifico&family=Caveat&family=Dancing+Script:wght@400;500;600;700&family=Indie+Flower&family=Josefin+Sans:wght@400;500;600;700&family=Anton&family=Bebas+Neue&family=Bitter:wght@400;500;600;700&family=Cabin:wght@400;500;600;700&family=Crimson+Text:wght@400;600;700&family=Fjalla+One&family=Inconsolata:wght@400;500;600;700&family=Mukta:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&family=Rubik:wght@400;500;600;700&family=Titillium+Web:wght@400;600;700&family=Work+Sans:wght@400;500;600;700&family=Barlow:wght@400;500;600;700&family=Comfortaa:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
