"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FolderTree, Package, Users, Bell, LogOut, Menu, X, Volume2, VolumeX, Sun, Moon, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useMusicStore } from '@/store/musicStore';
import { useTheme } from '@/components/theme-provider';

const tabs = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/categories', label: '카테고리', icon: FolderTree },
  { href: '/admin/products', label: '제품', icon: Package },
  { href: '/admin/users', label: '유저', icon: Users },
  { href: '/admin/charges', label: '충전 승인', icon: CreditCard },
  { href: '/admin/announcements', label: '공지', icon: Bell },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isMuted, toggleMute, initAudio } = useMusicStore();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    initAudio();
  }, [initAudio]);

  const onLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    router.replace('/admin/login');
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Admin Panel
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = pathname === t.href;
              return (
                <Link 
                  key={t.href} 
                  href={t.href} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30' 
                      : 'hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="relative h-9 w-9 hover:bg-muted transition-colors"
            title={isMuted ? "음악 켜기" : "음악 끄기"}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            ) : (
              <Volume2 className="h-5 w-5 text-teal-600 hover:text-teal-700 transition-colors" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative h-9 w-9 hover:bg-muted transition-colors"
            title="테마 전환"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Button 
            size="sm" 
            onClick={onLogout} 
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white ml-2"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="px-4 py-3 space-y-2">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = pathname === t.href;
              return (
                <Link 
                  key={t.href} 
                  href={t.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-teal-600 text-white' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {t.label}
                </Link>
              );
            })}
            
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMute}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {isMuted ? "음악 켜기" : "음악 끄기"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                테마 전환
              </Button>
            </div>
            
            <Button 
              size="sm" 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white mt-2"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
