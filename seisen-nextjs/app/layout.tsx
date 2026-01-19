import type { Metadata } from 'next';
import { Inter, Fira_Code } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import LoadingScreen from '@/components/layout/LoadingScreen';
import VisitorTracker from '@/components/layout/VisitorTracker';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
});

export const metadata: Metadata = {
  title: 'Seisen - Premium Scripts',
  description:
    'Seisen - Premium scripts and tools for enhanced gaming experiences. Access powerful scripts with advanced features.',
  keywords: 'scripts, gaming, seisen, premium scripts, game scripts, roblox scripts',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path fill='%2310b981' d='M60,10 L35,55 L50,55 L40,90 L65,45 L50,45 Z'/></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${firaCode.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <LoadingScreen />
        <VisitorTracker />
        
        {/* Background Text */}
        <div className="page-bg-text">Seisen</div>
        
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 ml-0 md:ml-[60px] relative z-10">
          {children}
        </main>
        
        {/* Footer */}
        <div className="ml-0 md:ml-[60px]">
          <Footer />
        </div>
      </body>
    </html>
  );
}
