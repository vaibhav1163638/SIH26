'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageProvider';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Camera,
  User,
  Clock,
  Cloud,
  Bell,
  MessageCircle,
  Settings,
  Leaf,
  Menu,
  X,
  Globe,
  Home,
} from 'lucide-react';
import { useState } from 'react';

export const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, key: 'dashboard' as const },
  { href: '/scan', icon: Camera, key: 'scan' as const },
  { href: '/farm', icon: User, key: 'farm' as const },
  { href: '/timeline', icon: Clock, key: 'timeline' as const },
  { href: '/weather', icon: Cloud, key: 'weather' as const },
  { href: '/assistant', icon: MessageCircle, key: 'assistant' as const },
  { href: '/settings', icon: Settings, key: 'settings' as const },
];

export type NavItem = {
  href: string;
  icon: any;
  key: string;
};

export default function Sidebar() {
  const pathname = usePathname();
  const { t, language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-primary text-primary-foreground p-2 rounded-xl shadow-lg"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 lg:static lg:z-auto flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <Leaf size={24} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">AgroSarthi AI</h1>
              <p className="text-xs text-sidebar-foreground/70">Smart Crop Health</p>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-primary/10 text-primary shadow-sm border border-primary/20'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground'
                  }`}
              >
                <Icon size={20} className={isActive ? 'text-primary' : ''} />
                <span>{t.nav[item.key]}</span>
              </Link>
            );
          })}
        </nav>

        {/* Language & Actions */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground transition-all"
          >
            <Globe size={20} />
            <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
          </button>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all"
          >
            <User size={20} />
            <span>{language === 'en' ? 'Logout' : 'लॉग आउट'}</span>
          </button>

          <div className="mt-4 px-4 text-xs text-sidebar-foreground/50">
            <p>SIH 2026 — PS 131</p>
            <p className="mt-1 opacity-60">Prototype Demo</p>
          </div>
        </div>
      </aside>
    </>
  );
}
