import type { Metadata } from 'next';
import './globals.css';
import { FactoryProvider } from '@/context/FactoryContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AIChatAssistant from '@/components/AIChatAssistant';
import AlertNotificationEngine from '@/components/AlertNotificationEngine';

export const metadata: Metadata = {
  title: 'SugarNxt Smart Factory Command Center',
  description: 'AI-Driven Cane-to-Bag Zero-Touch Manufacturing — SugarNxt Hackathon 2026',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0f172a] text-[#f1f5f9] overflow-hidden">
        <FactoryProvider>
        <div className="flex h-screen w-screen overflow-hidden">
              <Sidebar />
              <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-hidden bg-[#0f172a]">
                  {children}
                </main>
              </div>
            </div>
             <AIChatAssistant />
             <AlertNotificationEngine />
         </FactoryProvider>
      </body>
    </html>
  );
}
