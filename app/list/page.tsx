// src/app/list/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function StockList() {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('stock_calc_records');
    if (saved) {
      setRecords(JSON.parse(saved));
    }
  }, []);

  const clearRecords = () => {
    if (confirm('確定清空所有記錄？')) {
      setRecords([]);
      localStorage.removeItem('stock_calc_records');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-emerald-700 mb-8 text-center">儲存記錄</h1>

      {records.length === 0 ? (
        <p className="text-center text-zinc-500 py-20">暫無儲存記錄</p>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-emerald-600 text-white px-8 py-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">所有記錄 ({records.length} 筆)</h2>
            <button
              onClick={clearRecords}
              className="bg-white/30 hover:bg-white/40 px-5 py-2 rounded-lg text-sm transition"
            >
              清空
            </button>
          </div>

          <div className="p-8">
            {records.map((r, i) => (
              <div key={i} className="border-b py-4 last:border-b-0">
                <p className="font-bold">{r.stockCode} - {r.mode === 'buy' ? '買入' : '賣出'}</p>
                <p className="text-sm text-zinc-600">{new Date(r.timestamp).toLocaleString('zh-HK')}</p>
                <p className="mt-1">
                  股價: {r.price.toFixed(2)} | 總開支/淨額: {r.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                {r.currentPrice > 0 && (
                  <p className="text-sm mt-1">
                    現在股價: {r.currentPrice.toFixed(2)} | 潛在盈虧: {r.profit.toFixed(2)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}