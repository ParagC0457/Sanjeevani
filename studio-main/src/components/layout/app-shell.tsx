import { LayoutProvider } from '@/context/layout-context';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';

type Props = {
  children: React.ReactNode;
};

export default function AppShell({ children }: Props) {
  return (
    <LayoutProvider>
      <div className="flex min-h-screen bg-secondary/30">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </LayoutProvider>
  );
}
