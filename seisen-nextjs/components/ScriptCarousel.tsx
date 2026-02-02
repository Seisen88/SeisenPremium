'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from 'lucide-react'; // Using lucide icon as placeholder if needed, but we used spans for badges before.
import { ArrowRight, Code, Star, LayoutGrid } from 'lucide-react';

interface Script {
  id: string;
  name: string;
  scriptUrl: string;
  status: 'Working' | 'Discontinued';
  type: 'Free' | 'Premium' | 'Discontinued';
  universeId?: string;
  displayType?: string;
}

interface ScriptCarouselProps {
  scripts: Script[];
}

export default function ScriptCarousel({ scripts }: ScriptCarouselProps) {
  // Filter out discontinued scripts for the homepage showcase if desired, 
  // or simple show all working ones.
  const featuredScripts = scripts.filter(s => s.status === 'Working').slice(0, 10); 
  // Limit to 10 for performance/aesthetics in carousel

  return (
    <div className="w-full relative group">
      <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scrollbar-hide px-4 md:px-0">
        {featuredScripts.map((script) => (
          <div key={script.id} className="snap-center shrink-0 w-[280px] md:w-[320px]">
             <Card variant="hover" className="h-full flex flex-col p-5">
                <div className="flex items-start justify-between mb-4">
                   <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <Code className="w-6 h-6 text-emerald-500" />
                   </div>
                   <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                       script.type === 'Premium' 
                        ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                   }`}>
                       {script.displayType || script.type}
                   </span>
                </div>
                
                <h3 className="font-semibold text-white mb-2 line-clamp-1" title={script.name}>
                    {script.name}
                </h3>
                
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
                    Enhance your gameplay with our optimized {script.name} script. 
                    {script.type === 'Premium' ? ' Features exclusive automated farming and protections.' : ' Free to use with key system.'}
                </p>

                <Link href={`/scripts?id=${script.id}`} className="mt-auto">
                    <button className="w-full py-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] hover:border-[#444] text-gray-300 hover:text-white transition-all flex items-center justify-center gap-2 group/btn">
                        <span className="text-sm font-medium">View Script</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                </Link>
             </Card>
          </div>
        ))}
        
        {/* View All Card */}
        <div className="snap-center shrink-0 w-[200px] flex items-center justify-center">
            <Link href="/scripts" className="group/all flex flex-col items-center gap-3 text-gray-500 hover:text-emerald-500 transition-colors">
                <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[#333] group-hover/all:border-emerald-500/50 flex items-center justify-center transition-all">
                    <LayoutGrid className="w-6 h-6" />
                </div>
                <span className="font-medium text-sm">View All Scripts</span>
            </Link>
        </div>
      </div>
      
      {/* Fade Gradients for scroll indication */}
      <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none md:block hidden" />
    </div>
  );
}
