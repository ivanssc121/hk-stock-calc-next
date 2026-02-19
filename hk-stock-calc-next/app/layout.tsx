// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SideMenu from '@/components/SideMenu';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '港股費用計算器',
  description: '港股交易費用計算與記錄工具',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-HK">
      <body className={`${inter.className} bg-zinc-50`}>
        <SideMenu />
        <main className="md:ml-64 p-4">{children}</main>
      </body>
    </html>
  );
}