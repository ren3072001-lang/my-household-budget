"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, History, UploadCloud } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  
  const navItems = [
    { name: '祭壇', href: '/', icon: LayoutDashboard },
    { name: '書架', href: '/history', icon: History },
    { name: '導入', href: '/import', icon: UploadCloud },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border flex justify-around items-center py-3 z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-gold' : 'text-foreground/50'}`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{item.name}</span>
            {isActive && <div className="w-1 h-1 rounded-full bg-gold animate-pulse" />}
          </Link>
        );
      })}
    </nav>
  );
}
