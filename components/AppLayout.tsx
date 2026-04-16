import React from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="bg-background text-on-background antialiased min-h-screen">
      <TopBar title={title} />
      <Sidebar />
      <main className="md:pl-64 pt-16 min-h-screen pb-20 md:pb-0">
        <div className="max-w-screen-2xl mx-auto p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}

