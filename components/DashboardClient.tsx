"use client";
import { useState, useEffect } from "react";
import { DonutChart, Card } from "@tremor/react";

export function DashboardClient() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/transactions');
        const transactions = await res.json();
        
        // Aggregate by category
        const categories = ["消費", "投資", "浪費"];
        const aggregated = categories.map(cat => ({
          name: cat,
          amount: transactions
            .filter((t: any) => t.category === cat)
            .reduce((sum: number, t: any) => sum + Number(t.amount), 0),
          color: cat === "消費" ? "slate-500" : cat === "投資" ? "amber-600" : "rose-800"
        }));
        
        setData(aggregated);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const total = data.reduce((acc, curr) => acc + curr.amount, 0);
  const investment = data.find(d => d.name === "投資")?.amount || 0;
  const investmentRate = total > 0 ? ((investment / total) * 100).toFixed(1) : "0.0";

  if (loading) return <div className="text-center py-20 text-gold animate-pulse">魂の記録を読み込み中...</div>;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-2xl md:text-3xl font-serif text-gold mb-1 md:mb-2 text-center md:text-left">均衡の祭壇</h1>
        <p className="text-sm md:text-base text-foreground/70 text-center md:text-left">最新のサイクルのエネルギーの流れを観察します。</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="col-span-1 md:col-span-2 bg-card/60 border-navy-light backdrop-blur-md relative overflow-hidden group hover:border-gold/30 transition-colors p-4 md:p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
          <h3 className="text-base md:text-lg font-medium text-foreground mb-4 md:mb-6 font-serif">オーラ分布</h3>
          <div className="flex items-center justify-center p-2">
            <DonutChart
              data={data}
              category="amount"
              index="name"
              colors={["slate", "amber", "rose"]}
              className="w-48 h-48 md:w-72 md:h-72 drop-shadow-2xl"
              showAnimation={true}
              showLabel={false}
              valueFormatter={(number) => `¥${Intl.NumberFormat("ja-JP").format(number)}`}
            />
          </div>
        </Card>

        <Card className="col-span-1 bg-card/60 border-navy-light flex flex-col justify-center items-center text-center relative overflow-hidden p-6 md:p-8 group hover:border-gold/30 transition-colors">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
          <h3 className="text-xs md:text-sm font-medium text-foreground/60 tracking-widest uppercase mb-4">投資評価</h3>
          <div className="text-4xl md:text-6xl font-serif text-gold mb-2 drop-shadow-[0_0_15px_rgba(184,153,71,0.3)]">
            {investmentRate}%
          </div>
          <p className="text-xs md:text-sm text-foreground/70 mb-4 md:mb-6">目標: 30%</p>
          
          <div className="w-full bg-navy-light rounded-full h-1.5 mb-4 md:mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-gold-muted to-gold h-1.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, Number(investmentRate))}%` }}></div>
          </div>
          
          <p className="text-[10px] md:text-xs text-foreground/50 italic px-2 md:px-4">
            「知識への投資は常に最大の利益を生む。」
          </p>
        </Card>
      </div>
    </div>
  );
}
