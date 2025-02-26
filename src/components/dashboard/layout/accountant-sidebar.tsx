'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const menuItems = [
  { name: 'Dashboard', href: '/accountant/dashboard' },
  { name: 'Clients', href: '/clients' },
  { name: 'Documents', href: '/accountant/documents' },
  { name: 'Payments', href: '/accountant/payments' },
  { name: 'Settings', href: '/accountant/settings' },
];

export function AccountantSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="fixed md:inset-y-0 left-0 top-14 md:top-0 w-full md:w-64 bg-slate-900 text-white h-auto md:h-full z-20">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-slate-800 hidden md:block">
          <h2 className="text-xl font-bold">Accountant Portal</h2>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors',
                    pathname === item.href || pathname?.startsWith(`${item.href}/`)
                      ? 'bg-slate-800 font-medium'
                      : 'text-slate-300',
                  )}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
