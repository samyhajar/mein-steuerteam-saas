import { AccountantSidebar } from '@/components/dashboard/layout/accountant-sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex min-h-screen">
      <AccountantSidebar />
      <main className="flex-1 p-8 ml-64">
        <Skeleton className="h-8 w-64 mb-6" />

        <div className="grid grid-cols-1 gap-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    </div>
  );
}
