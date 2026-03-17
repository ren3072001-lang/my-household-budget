"use client";
import { useState, useRef } from "react";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import Papa from "papaparse";

type Transaction = { id: string; desc: string; amount: number; category: string | null };

const initialData: Transaction[] = [
  { id: "1", desc: "Steamゲーム購入", amount: 6000, category: null },
  { id: "2", desc: "技術書", amount: 3500, category: null },
  { id: "3", desc: "Uber Eats", amount: 2800, category: null },
];

export function ImportClient() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleDragStart = (id: string) => {
    setDraggedItemId(id);
  };

  const handleDrop = (category: string) => {
    if (!draggedItemId) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === draggedItemId ? { ...item, category } : item
      )
    );
    setDraggedItemId(null);
  };

  const saveToArchive = async () => {
    const categorized = items.filter(i => i.category !== null);
    if (categorized.length === 0) return;

    setSaving(true);
    try {
      const res = await fetch('/api/transactions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categorized)
      });
      if (res.ok) {
        // Remove saved items from list
        setItems(prev => prev.filter(i => i.category === null));
        alert("書架に記録を刻みました。");
      }
    } catch (err) {
      console.error("Failed to save transactions", err);
      alert("記録の保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseFile(file);
    // Reset file input so same file can be uploaded again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const parseFile = (file: File) => {
    if (file.name.endsWith(".json")) {
      // Basic JSON handling
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (Array.isArray(json)) {
             const parsedItems = json.map((row: any, index) => ({
               id: `imported-${Date.now()}-${index}`,
               desc: row.desc || row.name || row.description || `Item ${index}`,
               amount: Number(row.amount || row.price || 0),
               category: null
             }));
             setItems(prev => [...prev, ...parsedItems]);
          }
        } catch (err) {
          console.error("JSON Parse Error", err);
        }
      };
      reader.readAsText(file);
      return;
    }

    // Default to CSV
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedItems = results.data.map((row: any, index) => {
          const desc = row["desc"] || row["description"] || row["名前"] || row["内容"] || row["名称"] || row["Name"] || `Imported Item ${index + 1}`;
          let amountStr = String(row["amount"] || row["price"] || row["金額"] || row["支出"] || row["Amount"] || "0");
          amountStr = amountStr.replace(/[^0-9.-]+/g, "");
          const amount = parseFloat(amountStr) || 0;
          return {
            id: `imported-${Date.now()}-${index}`,
            desc,
            amount,
            category: null
          };
        });
        setItems((prev) => [...prev, ...parsedItems]);
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-serif text-gold mb-2">分類の儀式</h1>
        <p className="text-foreground/70">新しい記録を導入し、ふさわしいオーラを割り当てます。</p>
      </header>

      <div 
        className="relative border-2 border-dashed border-navy-light/80 rounded-lg p-12 text-center hover:border-gold/50 transition-colors bg-card/30 backdrop-blur-sm cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) parseFile(file);
        }}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".csv,.json" 
          className="hidden" 
          onChange={handleFileUpload} 
        />
        <UploadCloud className="w-12 h-12 text-gold-muted mx-auto mb-4 group-hover:text-gold transition-colors duration-500 group-hover:scale-110" />
        <p className="text-lg font-medium text-foreground">台帳のアップロード (CSV/JSON)</p>
        <p className="text-sm text-foreground/50 mt-2">ここにファイルをドラッグ＆ドロップするか、クリックして参照してください。</p>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-serif text-gold">分類の進捗</h3>
        <button 
          onClick={saveToArchive}
          disabled={saving || items.filter(i => i.category !== null).length === 0}
          className="bg-gold hover:bg-gold-muted text-navy font-bold py-2 px-6 rounded-full transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_0_15px_rgba(184,153,71,0.3)] hover:shadow-[0_0_25px_rgba(184,153,71,0.5)] active:scale-95"
        >
          {saving ? '魂を刻んでいます...' : '書架に保存する'}
          <CheckCircle2 className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 border border-border bg-card/60 p-4 rounded-lg min-h-[400px]">
          <h3 className="text-lg font-serif text-foreground/80 mb-4 border-b border-border/50 pb-2">未分類の記録</h3>
          <div className="space-y-3">
            {items.filter(i => !i.category).length === 0 && (
              <p className="text-sm text-foreground/40 italic text-center mt-8">静寂。すべての記録が分類されました。</p>
            )}
            {items.filter(i => !i.category).map(item => (
              <div 
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                className="bg-navy p-3 rounded border border-border cursor-grab active:cursor-grabbing hover:border-gold/30 transition-colors group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-sm">{item.desc}</div>
                    <div className="text-xs text-foreground/60 mt-1 font-serif">¥{item.amount.toLocaleString()}</div>
                  </div>
                </div>
                
                {/* Mobile Quick Classify Buttons */}
                <div className="flex gap-2 mt-3 md:hidden">
                  <button onClick={() => { setDraggedItemId(item.id); handleDrop("投資"); }} className="flex-1 text-[10px] py-1 border border-amber-900/50 rounded bg-amber-900/10 text-amber-500">投資</button>
                  <button onClick={() => { setDraggedItemId(item.id); handleDrop("消費"); }} className="flex-1 text-[10px] py-1 border border-slate-700 rounded bg-slate-800/20 text-slate-400">消費</button>
                  <button onClick={() => { setDraggedItemId(item.id); handleDrop("浪費"); }} className="flex-1 text-[10px] py-1 border border-rose-900/50 rounded bg-rose-900/10 text-rose-500">浪費</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "投資", color: "text-amber-500", border: "border-amber-900/50", bg: "bg-amber-900/10", glow: "group-hover:shadow-[0_0_15px_rgba(184,153,71,0.15)]" },
            { name: "消費", color: "text-slate-400", border: "border-slate-700", bg: "bg-slate-800/20", glow: "group-hover:shadow-[0_0_15px_rgba(100,116,139,0.15)]" },
            { name: "浪費", color: "text-rose-500", border: "border-rose-900/50", bg: "bg-rose-900/10", glow: "group-hover:shadow-[0_0_15px_rgba(159,18,57,0.15)]" }
          ].map(cat => (
            <div 
              key={cat.name}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(cat.name)}
              className={`border ${cat.border} ${cat.bg} rounded-lg p-4 min-h-[400px] flex flex-col transition-all duration-300 group ${cat.glow}`}
            >
              <h3 className={`text-lg font-serif ${cat.color} mb-4 border-b ${cat.border} pb-2 text-center uppercase tracking-widest text-sm`}>
                {cat.name}
              </h3>
              <div className="flex-1 space-y-3">
                {items.filter(i => i.category === cat.name).map(item => (
                  <div key={item.id} className="bg-card/80 p-3 rounded border border-border/50 flex justify-between items-center slide-in-from-left-2 animate-in">
                    <div>
                      <div className="font-medium text-sm text-foreground/90">{item.desc}</div>
                      <div className="text-xs text-foreground/60 mt-1 font-serif">¥{item.amount.toLocaleString()}</div>
                    </div>
                    <CheckCircle2 className={`w-4 h-4 ${cat.color} opacity-50`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
