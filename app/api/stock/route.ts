// src/app/api/stock/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: '缺少股票代號' }, { status: 400 });
  }

  try {
    // Yahoo Finance v8 chart endpoint（你之前用過嘅）
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=1d`;

    const res = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!res.ok) {
      throw new Error(`Yahoo API 錯誤：${res.status}`);
    }

    const json = await res.json();
    const result = json.chart?.result?.[0];

    if (result && result.meta) {
      const meta = result.meta;
      return NextResponse.json({
        success: true,
        name: meta.longName || meta.shortName || meta.symbol || '未知股票',
        price: meta.regularMarketPrice || meta.previousClose || 0,
      });
    } else {
      return NextResponse.json({ error: '無法解析股票資料' }, { status: 404 });
    }
  } catch (error) {
    console.error('Yahoo fetch 錯誤:', error);
    return NextResponse.json({ error: '伺服器錯誤，請稍後再試' }, { status: 500 });
  }
}