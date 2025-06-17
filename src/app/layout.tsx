/**
 * Root Layout
 * Main layout component for the entire application
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WhatsApp CRM - Professional Customer Relationship Management',
  description: 'Professional-grade WhatsApp Customer Relationship Management system built with Next.js and Spring Boot',
  keywords: ['WhatsApp', 'CRM', 'Customer Management', 'Business Messaging', 'Chat Management'],
  authors: [{ name: 'WhatsApp CRM Team' }],
  creator: 'WhatsApp CRM Team',
  publisher: 'WhatsApp CRM',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'WhatsApp CRM - Professional Customer Relationship Management',
    description: 'Professional-grade WhatsApp Customer Relationship Management system',
    url: '/',
    siteName: 'WhatsApp CRM',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WhatsApp CRM',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhatsApp CRM - Professional Customer Relationship Management',
    description: 'Professional-grade WhatsApp Customer Relationship Management system',
    images: ['/og-image.png'],
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#25d366" />
        <meta name="msapplication-TileColor" content="#25d366" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
