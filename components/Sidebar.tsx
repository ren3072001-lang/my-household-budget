"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, History, UploadCloud, BookOpen } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'ダッシュボード', href: '/', icon: LayoutDashboard },
    { name: '歴史の書架', href: '/history', icon: History },
    { name: '記録の導入', href: '/import', icon: UploadCloud },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col items-center py-8 max-md:hidden">
      <div className="flex items-center gap-3 mb-12">
        <BookOpen className="w-8 h-8 text-gold" />
        <h1 className="text-xl font-serif text-gold font-semibold tracking-wider">
          賢者の書斎
        </h1>
      </div>
      
      <nav className="flex flex-col gap-4 w-full px-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-navy text-gold border border-gold/30' : 'text-foreground/70 hover:text-gold hover:bg-navy-light/50'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
