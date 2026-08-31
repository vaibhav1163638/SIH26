'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useLanguage } from '@/components/LanguageProvider';
import { navItems, NavItem } from '@/components/Sidebar';
import { Leaf, Globe, User, Bell, Cloud, Activity, CheckCircle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

type AlertType = 'disease' | 'weather' | 'health';

interface Alert {
  id: number;
  type: AlertType;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

const INITIAL_ALERTS: Alert[] = [
  {
    id: 1,
    type: "disease",
    title: "High Disease Risk",
    message: "Late blight risk is elevated for your crop.",
    time: "10 min ago",
    unread: true
  },
  {
    id: 2,
    type: "weather",
    title: "Weather Warning",
    message: "Rain is expected in the next 24 hours.",
    time: "1 hour ago",
    unread: true
  },
  {
    id: 3,
    type: "health",
    title: "Crop Health Stable",
    message: "No new crop health issues detected.",
    time: "Yesterday",
    unread: false
  }
];

function getAlertIcon(type: AlertType) {
  switch (type) {
    case 'disease': return <ShieldAlert size={16} className="text-red-500" />;
    case 'weather': return <Cloud size={16} className="text-blue-500" />;
    case 'health': return <CheckCircle size={16} className="text-emerald-500" />;
    default: return <Activity size={16} className="text-primary" />;
  }
}

export default function TopNavbar() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();

  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + '/');

  const unreadCount = alerts.filter(a => a.unread).length;

  const markAllAsRead = () => {
    setAlerts(alerts.map(a => ({ ...a, unread: false })));
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    if (dropdownOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dropdownOpen]);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 hidden md:flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur px-4 md:px-8 transition-colors">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <Leaf size={18} className="text-primary" />
        </div>
        <span className="font-bold text-xl text-foreground tracking-tight">
          AgroSarthi
        </span>
      </Link>

      {/* Navigation items */}
      <motion.ul
        className="flex space-x-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {navItems.map((item: NavItem) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <motion.li
              key={item.href}
              whileHover={{ scale: 1.05 }}
            >
              <Link
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${active
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-muted/5 hover:text-foreground'
                  }`}
              >
                <Icon size={18} className={active ? 'text-primary' : ''} />
                <span className="text-sm">{item.key}</span>
              </Link>
            </motion.li>
          );
        })}
      </motion.ul>

      {/* Right side controls */}
      <div className="flex items-center space-x-3">
        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="relative flex items-center justify-center p-2 rounded text-muted-foreground hover:bg-muted/5 hover:text-foreground transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background" />
            )}
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-[350px] max-w-[calc(100vw-24px)] rounded-xl border border-border bg-card shadow-lg backdrop-blur z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/5">
                  <span className="font-semibold text-sm text-foreground">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                      <div className="w-12 h-12 bg-muted/20 rounded-full flex items-center justify-center mb-3">
                        <Bell size={20} className="text-muted-foreground" />
                      </div>
                      <p className="font-medium text-foreground">You're all caught up</p>
                      <p className="text-xs text-muted-foreground mt-1">No new notifications.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`flex gap-3 p-4 border-b border-border/50 last:border-0 hover:bg-muted/5 transition-colors cursor-pointer ${alert.unread ? 'bg-primary/5' : ''}`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {getAlertIcon(alert.type)}
                          </div>
                          <div className="flex-1 space-y-1 min-w-0">
                            <p className={`text-sm font-medium ${alert.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {alert.title}
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {alert.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground/80 mt-2">
                              {alert.time}
                            </p>
                          </div>
                          {alert.unread && (
                            <div className="flex-shrink-0">
                              <span className="block w-2 h-2 rounded-full bg-primary mt-1.5" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted/5 hover:text-foreground transition-colors border border-border/50"
        >
          <Globe size={16} />
          <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
        </button>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <User size={16} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
