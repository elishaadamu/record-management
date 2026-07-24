import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { AppLayout } from '@components/Layout/AppLayout';

export const metadata: Metadata = {
  title: 'MK360',
  description: 'MK360 Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppLayout>
            {children}
          </AppLayout>
        </Providers>
      </body>
    </html>
  );
}
