import './globals.css';
import { Providers } from '../components/providers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MaakLeans — Executive Laundry & Dry Cleaning SaaS',
  description: 'Enterprise multi-tenant laundry management platform for garment tracking, intake, processing, payments, and delivery.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
