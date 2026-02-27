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
      <head>
        {/* 解決手機黑邊 + 安全區 + dark mode */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no" />
        <meta name="theme-color" content="#f8fafc" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#f8fafc" media="(prefers-color-scheme: dark)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.className} bg-zinc-50 antialiased min-h-screen`}>
        <SideMenu />
        <main className="md:ml-64 p-4 min-h-screen">{children}</main>
      </body>
    </html>
  );
}