import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Blueprint — The marketplace for vibe-coded apps',
  description:
    'Download, remix, and share AI-built apps. Blueprint is the community marketplace for vibe coders. Free to browse. Free to remix.',
  openGraph: {
    title: 'Blueprint — Remix vibe-coded apps',
    description: 'The marketplace where vibe coders share, download, and remix AI-built tools. 5x fewer tokens than building from scratch.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blueprint — Remix vibe-coded apps',
    description: 'The marketplace where vibe coders share, download, and remix AI-built tools.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
