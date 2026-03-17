"use client";
import { useState, useEffect } from "react";
import { AreaChart, Card } from "@tremor/react";

export function HistoryClient() {
  const [data, setData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/transactions');
        const allTransactions = await res.json();
        setTransactions(allTransactions.slice(0, 10)); // Just show recent 10 in the list

        // Group by month for chart
        const months = ["10月", "11月", "12月", "1月", "2月", "3月"];
        const chartData = months.map(month => {
          // This is a simplified grouping for the demo. 
          // Real logic would parse dates from t.date
          const monthTransactions = allTransactions.filter((t: any) => {
             const tMonth = new Date(t.date).getMonth() + 1;
             return `${tMonth}月` === month;
          });

          return {
            date: month,
            消費: monthTransactions.filter((t: any) => t.category === "消費").reduce((s: number, t: any) => s + Number(t.amount), 0),
            投資: monthTransactions.filter((t: any) => t.category === "投資").reduce((s: number, t: any) => s + Number(t.amount), 0),
            浪費: monthTransactions.filter((t: any) => t.category === "浪費").reduce((s: number, t: any) => s + Number(t.amount), 0),
          };
        });

        setData(chartData);
      } catch (err) {
        console.error("Failed to fetch history data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-20 text-gold animate-pulse">時の記憶を紐解いています...</div>;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-2xl md:text-3xl font-serif text-gold mb-1 md:mb-2 text-center md:text-left">アーカイブ</h1>
        <p className="text-sm md:text-base text-foreground/70 text-center md:text-left">時の経過とともにあなたの財務オーラの進化をたどります。</p>
      </header>

      <Card className="bg-card/60 border-navy-light backdrop-blur-md p-4 md:p-6">
        <h3 className="text-base md:text-lg font-medium text-foreground mb-4 font-serif text-center md:text-left">オーラの共鳴（過去6ヶ月）</h3>
        <AreaChart
          className="h-64 md:h-80"
          data={data}
          index="date"
          categories={["消費", "投資", "浪費"]}
          colors={["slate", "amber", "rose"]}
          valueFormatter={(number) => `¥${Intl.NumberFormat("ja-JP").format(number)}`}
          showAnimation={true}
          stack={true}
          showLegend={false}
        />
        <p className="text-[10px] md:text-xs text-foreground/50 mt-4 italic text-center">時の螺旋に刻まれたあなたの成長の軌跡です。</p>
      </Card>

      <Card className="bg-navy-light/30 border-gold/20 animate-in slide-in-from-bottom-4 p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-serif text-gold mb-2 md:mb-4"> 最近の記録</h3>
        <p className="text-sm md:text-base text-foreground/80 mb-4">書架に刻まれた最新の魂の動き。</p>
        <div className="space-y-2 md:space-y-4">
          {transactions.length === 0 && <p className="text-foreground/50 italic text-sm">記録がまだありません。</p>}
          {transactions.map((item, i) => (
            <div key={i} className="flex justify-between items-center py-2 md:py-3 border-b border-border/50 last:border-0 hover:bg-navy/30 px-2 md:px-4 rounded transition-colors group">
              <span className="text-sm md:text-base text-foreground/90 font-medium group-hover:text-gold transition-colors truncate max-w-[150px] md:max-w-none">{item.desc}</span>
              <div className="flex items-center gap-2 md:gap-4">
                <span className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded border ${item.category === '投資' ? 'bg-amber-900/20 text-amber-500 border-amber-900/50' : item.category === '消費' ? 'bg-slate-800/50 text-slate-400 border-slate-700' : 'bg-rose-900/20 text-rose-500 border-rose-900/50'}`}>
                  {item.category || '未分類'}
                </span>
                <span className="text-xs md:text-sm font-serif whitespace-nowrap">¥{Number(item.amount).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
