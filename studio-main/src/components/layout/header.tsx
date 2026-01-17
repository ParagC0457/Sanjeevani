'use client';

import { Menu } from 'lucide-react';
import { useLayout } from '@/context/layout-context';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { collapsed, setCollapsed } = useLayout();

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 sm:px-6 lg:px-8">
       <div className="flex items-center gap-2">
         <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Sidebar</span>
         </Button>
         <span className="text-lg font-semibold text-primary">Sanjeevani</span>
       </div>
       <div>
         {/* Future user menu can go here */}
       </div>
    </header>
  );
}
