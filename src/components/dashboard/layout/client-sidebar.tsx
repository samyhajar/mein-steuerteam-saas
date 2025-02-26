'use client';

import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarUserInfo } from './sidebar-user-info';

export default function ClientSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', href: '/client/dashboard' },
    { name: 'Documents', href: '/client/documents' },
    { name: 'Settings', href: '/client/settings' },
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background lg:flex">
      <div className="border-b px-6 py-2 h-14 flex items-center">
        <Link href="/client/dashboard" className="flex items-center gap-2 font-semibold">
          <span>Client Portal</span>
        </Link>
      </div>
      <div className="flex flex-1 flex-col">
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    pathname === item.href
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
        <div className="border-t p-4">
          <SidebarUserInfo />
        </div>
      </div>
    </aside>
  );
}
