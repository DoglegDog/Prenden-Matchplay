import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Matchplay 2026 – Golf Club Berlin-Prenden',
  description: 'Turnierbaum Team- und Einzel-Matchplay 2026',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
