import { DashboardClientsCard } from '@/components/dashboard/landing/components/dashboard-clients-card';
import { DashboardDocumentsCard } from '@/components/dashboard/landing/components/dashboard-documents-card';
import { DashboardSubscriptionCardGroup } from '@/components/dashboard/landing/components/dashboard-subscription-card-group';

export function DashboardLandingPage() {
  return (
    <div className={'grid flex-1 items-start gap-6 p-0 md:grid-cols-1 lg:grid-cols-2'}>
      <div className={'flex flex-col gap-6'}>
        <DashboardClientsCard />
        <DashboardDocumentsCard />
      </div>
      <div className={'flex flex-col gap-6'}>
        <DashboardSubscriptionCardGroup />
      </div>
    </div>
  );
}
