'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [bank, setBank] = useState('scb');
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
  const [stockSymbol, setStockSymbol] = useState('');
  const [stockName, setStockName] = useState('');
  const [price, setPrice] = useState<number | ''>(''); // 買入股價，手動
  const [lotSize, setLotSize] = useState<number | ''>(100);
  const [lots, setLots] = useState<number | ''>(1);
  const [currentPrice, setCurrentPrice] = useState<number | ''>(''); // 現在股價，API 後自動
  const [calculated, setCalculated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [tradeAmount, setTradeAmount] = useState(0);
  const [totalShares, setTotalShares] = useState(0);
  const [totalFees, setTotalFees] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [latestCostPrice, setLatestCostPrice] = useState(0);
  const [profit, setProfit] = useState(0);
  const [feeDetails, setFeeDetails] = useState<Array<{ name: string; amount: number; desc: string }>>([]);

  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('stock_calc_records');
    if (saved) setRecords(JSON.parse(saved));
  }, []);

  useEffect(() => {
    calculate();
  }, [bank, tradeMode, price, lotSize, lots, currentPrice]);

  const handleSearch = async () => {
    if (!stockSymbol) {
      setErrorMsg('請輸入股票代號');
      return;
    }

    let symbol = stockSymbol.trim().toUpperCase();
    if (/^\d+$/.test(symbol)) symbol = symbol.padStart(4, '0');
    if (!symbol.endsWith('.HK')) symbol += '.HK';

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/stock?symbol=${symbol}`);
      const data = await res.json();

      if (data.success) {
        setStockName(data.name);
        setCurrentPrice(data.price);
        calculate();
        setSuccessMsg(`已取得：${data.name} 最新價 $${data.price.toFixed(2)}`);
      } else {
        setErrorMsg(data.error || '查詢失敗，請檢查代號');
      }
    } catch (error) {
      console.error('查詢錯誤:', error);
      setErrorMsg('伺服器錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const saveRecord = () => {
    if (!calculated) {
      setErrorMsg('請先計算有效資料');
      return;
    }

    const record = {
      stockCode: fullStockCode,
      price: Number(price),
      lotSize,
      lots,
      currentPrice: Number(currentPrice),
      mode: tradeMode,
      totalShares,
      tradeAmount,
      totalFees,
      totalCost,
      latestCostPrice,
      profit,
      timestamp: Date.now(),
    };
    const newRecords = [...records, record];
    setRecords(newRecords);
    localStorage.setItem('stock_calc_records', JSON.stringify(newRecords));
    setSuccessMsg('已儲存記錄');
  };

  const clearRecords = () => {
    if (confirm('確定清空所有記錄？')) {
      setRecords([]);
      localStorage.removeItem('stock_calc_records');
      setSuccessMsg('已清空所有記錄');
    }
  };

  const calculate = () => {
    if (!price || price <= 0 || !lotSize || lotSize <= 0 || !lots || lots <= 0) {
      setCalculated(false);
      setLatestCostPrice(0);
      setTotalShares(0);
      setTradeAmount(0);
      setTotalFees(0);
      setTotalCost(0);
      setProfit(0);
      setFeeDetails([]);
      return;
    }

    const shares = lotSize * lots;
    const amount = shares * Number(price);

    let commissionRate = 0.002;
    let minCommission = 50;
    if (bank === 'hsbc') {
      commissionRate = 0.0025;
      minCommission = 100;
    } else if (bank === 'boc') {
      commissionRate = 0.002;
      minCommission = 100;
    }

    const commission = Math.max(amount * commissionRate, minCommission);
    const stampDuty = Math.ceil(amount * 0.001);
    const tradingFee = Math.round(amount * 0.0000565 * 100) / 100;
    const sfcLevy = Math.round(amount * 0.000027 * 100) / 100;
    const frcLevy = Math.round(amount * 0.0000015 * 100) / 100;
    const settlementFee = Math.min(Math.max(Math.round(amount * 0.00002 * 100) / 100, 2), 100);

    const fees = [
      { name: '經紀費', amount: commission, desc: `${(commissionRate * 100).toFixed(2)}% (最低 $${minCommission})` },
      { name: '印花稅', amount: stampDuty, desc: '0.1% 向上取整' },
      { name: '交易所費用', amount: tradingFee, desc: '0.00565%' },
      { name: '證監會徵費', amount: sfcLevy, desc: '0.0027%' },
      { name: '財匯局徵費', amount: frcLevy, desc: '0.00015%' },
      { name: '結算費', amount: settlementFee, desc: '0.002% (min $2 max $100)' },
    ];

    const totalFeesSum = fees.reduce((sum, f) => sum + f.amount, 0);
    const cost = tradeMode === 'buy' ? amount + totalFeesSum : amount - totalFeesSum;

    setTotalShares(shares);
    setTradeAmount(amount);
    setTotalFees(totalFeesSum);
    setTotalCost(cost);
    setFeeDetails(fees);
    setLatestCostPrice(tradeMode === 'buy' && shares > 0 ? cost / shares : 0);

    if (tradeMode === 'buy' && Number(currentPrice) > 0) {
      const sellAmount = shares * Number(currentPrice);
      const sellCommission = Math.max(sellAmount * commissionRate, minCommission);
      const sellStampDuty = Math.ceil(sellAmount * 0.001);
      const sellTradingFee = Math.round(sellAmount * 0.0000565 * 100) / 100;
      const sellSfcLevy = Math.round(sellAmount * 0.000027 * 100) / 100;
      const sellFrcLevy = Math.round(sellAmount * 0.0000015 * 100) / 100;
      const sellSettlement = Math.min(Math.max(Math.round(sellAmount * 0.00002 * 100) / 100, 2), 100);

      const sellFeesSum = sellCommission + sellStampDuty + sellTradingFee + sellSfcLevy + sellFrcLevy + sellSettlement;
      const netSell = sellAmount - sellFeesSum;
      setProfit(netSell - cost);
    } else {
      setProfit(0);
    }

    setCalculated(true);
  };

  const fullStockCode = (() => {
    if (!stockSymbol) return '';
    let sym = stockSymbol.trim().toUpperCase();
    if (/^\d+$/.test(sym)) sym = sym.padStart(4, '0');
    if (!sym.endsWith('.HK')) sym += '.HK';
    return sym;
  })();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 bg-zinc-50 min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-emerald-700">港股費用計算器</h1>
        <p className="text-zinc-600 mt-2">Yahoo API 版 • server-side fetch • 無 CORS</p>
      </div>

      {/* 輸入區 */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
        <div className="bg-emerald-600 text-white px-8 py-6">
          <h2 className="text-2xl font-bold">輸入交易資料</h2>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">銀行</label>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full px-5 py-4 border border-zinc-300 rounded-xl text-lg focus:border-emerald-500 focus:ring-emerald-500"
              >
                <option value="scb">渣打銀行</option>
                <option value="hsbc">滙豐銀行</option>
                <option value="boc">中銀香港</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">買入 / 賣出</label>
              <div className="flex border border-zinc-300 rounded-full overflow-hidden">
                <button
                  onClick={() => setTradeMode('buy')}
                  className={`flex-1 py-3 font-medium ${tradeMode === 'buy' ? 'bg-emerald-600 text-white' : 'bg-white text-zinc-700'}`}
                >
                  買入
                </button>
                <button
                  onClick={() => setTradeMode('sell')}
                  className={`flex-1 py-3 font-medium ${tradeMode === 'sell' ? 'bg-emerald-600 text-white' : 'bg-white text-zinc-700'}`}
                >
                  賣出
                </button>
              </div>
            </div>

            <div className="overflow-hidden">
              <label className="block text-sm font-medium text-zinc-700 mb-2">股票代號</label>
              <div className="flex gap-2 items-center">
                <input
                  value={stockSymbol}
                  onChange={(e) => setStockSymbol(e.target.value)}
                  className="min-w-0 flex-1 px-5 py-4 border border-zinc-300 rounded-xl text-lg focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="輸入 388 或 700 均可"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className={`bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] gap-2 shrink-0`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      查詢中...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-search"></i> 查詢
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">股票名稱（自動取得）</label>
              <input
                value={stockName}
                disabled
                className="w-full px-5 py-4 border border-zinc-300 rounded-xl text-lg bg-gray-100 cursor-not-allowed"
                placeholder="查詢後顯示"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                {tradeMode === 'buy' ? '買入股價' : '賣出股價'} (HKD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-5 py-4 border border-zinc-300 rounded-xl text-lg focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="手動輸入買入成本"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">每手股數</label>
              <input
                type="text"                  // 改成 text
                inputMode="numeric"          // 手機顯示數字鍵盤
                pattern="[0-9]*"             // 只允許數字
                value={lotSize}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d+$/.test(val)) {
                    setLotSize(val === '' ? '' : Number(val));
                  }
                }}
                className="w-full px-4 py-3 border border-zinc-300 rounded-xl text-base focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="例如 100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                {tradeMode === 'buy' ? '買入手數' : '賣出手數'} (lots)
              </label>
              <input
                type="text"                  // 改成 text
                inputMode="numeric"
                pattern="[0-9]*"
                value={lots}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d+$/.test(val)) {
                    setLots(val === '' ? '' : Number(val));
                  }
                }}
                className="w-full px-4 py-3 border border-zinc-300 rounded-xl text-base focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="例如 1 手"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-2">現在股價 (估計盈利/虧損用)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-5 py-4 border border-zinc-300 rounded-xl text-lg focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="查詢後自動填入最新市價"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-between items-center">
            <button
              onClick={() => {
                setStockSymbol('');
                setStockName('');
                setPrice('');
                setLotSize(100);
                setLots(1);
                setCurrentPrice('');
                setCalculated(false);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="bg-gray-200 hover:bg-gray-300 px-6 py-3 rounded-xl flex items-center gap-2 transition"
            >
              <i className="fa-solid fa-rotate-left"></i> 重置
            </button>

            <button
              onClick={saveRecord}
              disabled={!calculated || loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fa-solid fa-save"></i> 儲存記錄
            </button>
          </div>

          {errorMsg && <p className="mt-4 text-red-600 text-center font-medium">{errorMsg}</p>}
          {successMsg && <p className="mt-4 text-green-600 text-center font-medium">{successMsg}</p>}
        </div>
      </div>

      {/* 結果區 */}
      {calculated && (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="bg-emerald-700 text-white px-8 py-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              <p className='text-lg'>{bank === 'scb' ? '渣打' : bank === 'hsbc' ? '滙豐' : '中銀'} •</p> 
              <p className='text-lg'>{stockName || fullStockCode || '股票'}</p>
              <p className='text-lg'>{tradeMode === 'buy' ? '買入' : '賣出'}</p>
            </h2>
            <button
              onClick={() => setCalculated(false)}
              className="bg-white/20 hover:bg-white/30 text-white px-5 py-2 rounded-lg text-sm flex items-center gap-2 transition"
            >
              <i className="fa-solid fa-rotate-left"></i> 重置
            </button>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              <div className="bg-emerald-50 rounded-2xl p-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-emerald-800">總股數</p>
                    <p className="text-3xl font-bold text-emerald-900">{totalShares.toLocaleString()} 股</p>
                  </div>
                  <div>
                    <p className="text-sm text-emerald-800">{tradeMode === 'buy' ? '交易金額' : '賣出金額'}</p>
                    <p className="text-2xl font-bold text-emerald-900">
                      HK$ {tradeAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="mt-6 text-center border-t border-emerald-200 pt-6">
                  <p className="text-xl font-bold text-emerald-700">
                    {tradeMode === 'buy' ? '總開支' : '扣除費用後淨收款'}
                  </p>
                  <p className="text-4xl font-extrabold text-emerald-800 mt-2">
                    HK$ {totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                {tradeMode === 'buy' && (
                  <div className="mt-6 text-center border-t border-emerald-200 pt-6">
                    <p className="text-xl font-bold text-emerald-700">最新成本價（每股）</p>
                    <p className="text-4xl font-bold text-emerald-900 mt-2">
                      HK$ {latestCostPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-emerald-600 mt-1">(總開支 ÷ 總股數，已包含所有買入費用)</p>
                  </div>
                )}
              </div>

              {Number(currentPrice) > 0 && tradeMode === 'buy' && (
                <div className="bg-blue-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4 text-blue-800">潛在盈利估計 (現在賣出)</h3>
                  <p className="text-3xl font-bold text-center" style={{ color: profit >= 0 ? '#16a34a' : '#dc2626' }}>
                    HK$ {profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-center mt-2" style={{ color: profit >= 0 ? '#16a34a' : '#dc2626' }}>
                    {profit >= 0 ? '盈利' : '虧損'} (已扣賣出所有費用)
                  </p>
                </div>
              )}

              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 text-zinc-800">費用明細（{bank === 'scb' ? '渣打' : bank === 'hsbc' ? '滙豐' : '中銀'}）</h3>
                <div className="bg-white rounded-2xl shadow-sm divide-y divide-zinc-200">
                  {feeDetails.map((fee, i) => (
                    <div key={i} className="flex justify-between py-4 px-6 hover:bg-zinc-50 transition">
                      <div>
                        <p className="font-medium">{fee.name}</p>
                        <p className="text-sm text-zinc-500">{fee.desc}</p>
                      </div>
                      <p className="font-semibold">HK$ {fee.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* {records.length > 0 && (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-emerald-600 text-white px-8 py-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">儲存記錄 ({records.length} 筆)</h2>
            <button onClick={clearRecords} className="bg-white/30 hover:bg-white/40 px-5 py-2 rounded-lg text-sm transition">
              清空
            </button>
          </div>
          <div className="p-8">
            {records.map((r, i) => (
              <div key={i} className="border-b py-4 last:border-b-0">
                <p className="font-bold">{r.stockCode} - {r.mode === 'buy' ? '買入' : '賣出'}</p>
                <p className="text-sm text-zinc-600">{new Date(r.timestamp).toLocaleString('zh-HK')}</p>
                <p>股價: {r.price.toFixed(2)} | 總開支/淨額: {r.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
}