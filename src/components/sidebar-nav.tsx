
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  BrainCircuit,
  BarChart3,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  LogOut,
  FlaskConical,
  ListTodo,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function SidebarNav() {
  const pathname = usePathname();
  const navItems: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: 'My Tasks', href: '/my-tasks', icon: <ListTodo className="h-5 w-5" /> },
    { title: 'Tasks', href: '/tasks', icon: <CheckSquare className="h-5 w-5" /> },
    { title: 'Teams', href: '/teams', icon: <Users className="h-5 w-5" /> },
    { title: 'Learning', href: '/learning', icon: <BrainCircuit className="h-5 w-5" /> },
    { title: 'Reports', href: '/reports', icon: <BarChart3 className="h-5 w-5" /> },
    { title: 'Collaboration', href: '/collaboration', icon: <MessageSquare className="h-5 w-5" /> },
    { title: 'AI Toolkit', href: '/toolkit', icon: <FlaskConical className="h-5 w-5" /> },
  ];

  return (
    <TooltipProvider>
      <div className="flex h-full max-h-screen flex-col gap-2 bg-sidebar text-sidebar-foreground">
        <div className="flex h-14 items-center border-b border-sidebar-border px-4 lg:h-[60px] lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-headline font-semibold">
            <ShieldCheck className="h-6 w-6 text-sidebar-primary" />
            <span className="">CyberStack AI</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard');
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-primary hover:bg-sidebar-accent',
                    isActive && 'bg-sidebar-accent text-sidebar-primary'
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
                href="/admin"
                className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-primary hover:bg-sidebar-accent', pathname.startsWith('/admin') && 'bg-sidebar-accent text-sidebar-primary')}
              >
              <ShieldAlert className="h-5 w-5" />
              Admin
            </Link>
            <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-primary hover:bg-sidebar-accent"
              >
              <LogOut className="h-5 w-5" />
              Logout
            </Link>
          </nav>
        </div>
      </div>
    </TooltipProvider>
  );
}
