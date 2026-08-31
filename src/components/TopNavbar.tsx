'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useLanguage } from '@/components/LanguageProvider';
import { navItems, NavItem } from '@/components/Sidebar';
import { Leaf, Globe, User, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TopNavbar() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + '/');

  return (
    <nav className="fixed top-0 inset-x-0 z-50 hidden md:flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur px-4 md:px-8 transition-colors">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <Leaf size={18} className="text-primary" />
        </div>
        <span className="font-bold text-xl text-foreground tracking-tight">
          CropScan<span className="text-primary">.ai</span>
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
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/5 hover:text-foreground'
                }`}
              >
                <Icon size={18} className={active ? 'text-primary' : ''} />
                <span className="text-sm font-medium">{item.key}</span>
              </Link>
            </motion.li>
          );
        })}
      </motion.ul>

      {/* Right side controls */}
      <div className="flex items-center space-x-3">
        <Link
          href="/alerts"
          className="flex items-center justify-center p-2 rounded text-muted-foreground hover:bg-muted/5 hover:text-foreground transition-colors"
        >
          <Bell size={20} />
        </Link>
        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}

          className="flex items-center gap-1 px-2 py-1 rounded text-sm text-muted-foreground hover:bg-muted/5 hover:text-foreground transition-colors"
        >
          <Globe size={18} />
          <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
        </button>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-1 px-2 py-1 rounded text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors"
        >
          <User size={18} />
          <span>{language === 'en' ? 'Logout' : 'लॉग आउट'}</span>
        </button>
      </div>
    </nav>
  );
}
