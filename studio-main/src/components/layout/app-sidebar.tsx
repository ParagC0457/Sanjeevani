
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HeartPulse,
  LayoutDashboard,
  Pill,
  FileText,
  User,
  LogOut,
  Clipboard,
  Settings,
  Shuffle,
  MapPin,
  IndianRupee,
  ShieldCheck,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { useLayout } from '@/context/layout-context';
import { cn } from '@/lib/utils';
import { useSession, signOut } from 'next-auth/react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/compare-medicines', label: 'Compare Medicines', icon: Shuffle },
  { href: '/biodata', label: 'Health Tracking', icon: Clipboard },
  { href: '/medications', label: 'Medications', icon: Pill },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/locations', label: 'Locations', icon: MapPin },
  { href: '/cost-estimator', label: 'Cost Estimator', icon: IndianRupee },
  { href: '/health-hub', label: 'Health Alerts', icon: ShieldCheck },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { collapsed } = useLayout();
  const { data: session } = useSession();

  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || 'user@example.com';
  const userInitials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div
      className={cn(
        'flex flex-col bg-card text-card-foreground border-r transition-all duration-300 h-screen sticky top-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center gap-2 p-4 border-b">
        <HeartPulse className="h-8 w-8 text-primary" />
        {!collapsed && <span className="text-lg font-semibold text-primary">Sanjeevani</span>}
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
              pathname === item.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
              collapsed && 'justify-center'
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-5 w-5" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-2 border-t">
        <div className={cn('p-2 rounded-lg bg-secondary', collapsed ? 'p-1' : 'p-2')}>
          <div className="flex items-center gap-3">
            <Link href="/profile" title="Profile">
              <Avatar className={cn(collapsed ? 'h-9 w-9' : 'h-10 w-10')}>
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </Link>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-secondary-foreground">{userName}</p>
                <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
              </div>
            )}
          </div>
        </div>

        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground w-full mt-2',
            pathname === '/settings' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="h-5 w-5" />
          {!collapsed && <span>Settings</span>}
        </Link>

        <Button
          variant="outline"
          className={cn('w-full mt-2', collapsed && 'justify-center')}
          onClick={() => signOut()}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </div>
  );
}
