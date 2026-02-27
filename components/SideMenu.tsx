// src/components/SideMenu.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SideMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 漢堡按鈕 - 手機顯示 */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-emerald-600 text-white rounded-full shadow-lg"
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

      {/* 側邊選單 - 手機滑出 + 桌面固定 */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:w-72 md:shadow-none md:bg-transparent md:overflow-visible`}
      >
        <div className="p-8 md:p-6 flex flex-col h-full">
          {/* 手機版：按鈕在上，標題在下 */}
         

          {/* 標題 - 放在按鈕下方，加大間距 */}
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-emerald-700 leading-snug break-words">
              港股費用<br />計算器
            </h2>
          </div>

          {/* 導航項目 - 加大間距 */}
          <nav className="flex-1 space-y-4">
            <Link
              href="/"
              className="block px-6 py-5 rounded-xl hover:bg-emerald-50 text-zinc-800 font-medium text-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              計算器
            </Link>

            <Link
              href="/list"
              className="block px-6 py-5 rounded-xl hover:bg-emerald-50 text-zinc-800 font-medium text-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              儲存記錄
            </Link>
          </nav>

          {/* 桌面版不需額外關閉按鈕，手機版已在上方 */}
        </div>
      </div>

      {/* 手機遮罩層 - 點外面關閉 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}