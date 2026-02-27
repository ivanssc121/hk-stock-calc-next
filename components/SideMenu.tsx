// src/components/SideMenu.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SideMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 固定頭部 - 所有尺寸顯示 */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white shadow-md border-b border-emerald-100">
        <div className="flex items-center justify-between h-full px-4">
          {/* 漢堡按鈕 */}
          <button
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="開啟/關閉選單"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* 應用標題 */}
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold text-emerald-700">港股費用計算器</h1>
          </div>

          {/* 佔位符保持對稱 */}
          <div className="w-10"></div>
        </div>
      </header>

      {/* 側邊選單 - 所有尺寸作為抽屜 */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto pt-16 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 md:p-6 flex flex-col h-full">
          {/* 導航項目 */}
          <nav className="flex-1 space-y-4">
            <Link
              href="/"
              className="block px-6 py-4 rounded-xl hover:bg-emerald-50 text-zinc-800 font-medium text-base md:text-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              計算器
            </Link>

            <Link
              href="/list"
              className="block px-6 py-4 rounded-xl hover:bg-emerald-50 text-zinc-800 font-medium text-base md:text-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              儲存記錄
            </Link>
          </nav>
        </div>
      </div>

      {/* 遮罩層 - 點外面關閉 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}