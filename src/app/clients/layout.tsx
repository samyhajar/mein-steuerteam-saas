'use client';

import { AccountantSidebar } from '@/components/dashboard/layout/accountant-sidebar';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ClientsLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Check if user is authenticated and is an accountant
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Set isClient to true for hydration
      setIsClient(true);
    };

    checkAuth();
  }, [router]);

  if (!isClient) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      {/* Mobile menu toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-slate-900 p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Accountant Portal</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar - hidden on mobile unless toggled */}
      <div className={`md:block ${isMobileMenuOpen ? 'block' : 'hidden'} z-20`}>
        <AccountantSidebar />
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-4 md:pt-0">
        <div className="p-4 md:p-8 mt-12 md:mt-0">{children}</div>
      </main>
    </div>
  );
}
