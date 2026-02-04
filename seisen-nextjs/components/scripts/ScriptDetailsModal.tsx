'use client';

import { X, Copy, Check, Lock, Crown, Code, Shield } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { copyToClipboard } from '@/lib/utils';
import { Dialog } from '@headlessui/react'; // Assuming headlessui is installed, or we build a custom one.
// Actually, let's build a custom one to avoid dep issues if not installed, or match existing style.
// Checking existing modal usage... looks like we don't have a standard modal yet or used Overlay.
// I will build a custom accessible modal using fixed overlay.

interface Script {
  id: string;
  name: string;
  scriptUrl: string;
  status: 'Working' | 'Discontinued';
  type: string;
  universeId?: string;
  displayType?: string;
  description?: string;
  features?: string[];
}

interface ScriptDetailsModalProps {
  script: Script | null;
  isOpen: boolean;
  onClose: () => void;
  thumbnailUrl?: string;
}

export default function ScriptDetailsModal({ script, isOpen, onClose, thumbnailUrl }: ScriptDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !script) return null;

  const handleCopy = async () => {
    // Basic loader text
    const textToCopy = `loadstring(game:HttpGet("https://api.junkie-development.de/api/v1/luascripts/public/8ac2e97282ac0718aeeb3bb3856a2821d71dc9e57553690ab508ebdb0d1569da/download"))()`;
    
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container - Split Layout */}
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 max-w-6xl w-full p-4 animate-in zoom-in-95 duration-200">
        
        {/* Close Button (Global Mobile) */}
        <button 
          onClick={onClose}
          className="absolute top-0 right-0 z-50 p-2 rounded-full bg-black/50 text-white md:hidden"
        >
          <X className="w-6 h-6" />
        </button>

        {/* LEFT CARD: The Visual (Fully Rounded & Independent) */}
        <div className="w-full max-w-sm aspect-square relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group bg-[#0a0a0a]">
          {thumbnailUrl ? (
             <Image
                src={thumbnailUrl}
                alt={script.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-4">
               <Code className="w-16 h-16" />
               <p className="text-sm">No Preview Available</p>
            </div>
          )}
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
             <div className="flex items-center gap-3 mb-2">
                {script.status === 'Working' ? (
                  <div className="relative flex-shrink-0">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                ) : (
                  <div className="relative flex-shrink-0">
                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                )}
                <h2 className="text-2xl font-bold text-white drop-shadow-md leading-tight">
                  {script.name}
                </h2>
             </div>
             
             <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-black/40 backdrop-blur-sm border border-white/10 text-[10px] text-gray-300 font-mono">
                <Code className="w-3 h-3" />
                ID: {script.id}
             </div>
          </div>
        </div>

        {/* RIGHT CARD: Details Panel with Accent Color */}
        <div className="flex-1 w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[600px] h-full overflow-hidden" style={{ backgroundColor: 'var(--accent)' }}>
           
           <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
               {/* Header / Type Badge */}
               <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/20 border border-black/30 text-black">
                            {script.displayType || script.type}
                        </span>
                        {script.universeId && (
                            <span className="text-xs text-black/70 flex items-center gap-1 font-mono">
                                 Game ID: {script.universeId}
                            </span>
                        )}
                  </div>
                  
                  {/* Desktop Close */}
                  <button 
                    onClick={onClose}
                    className="hidden md:flex p-2 rounded-lg hover:bg-black/10 text-black/70 hover:text-black transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
               </div>

               {/* Description */}
               <div className="mb-8">
                  <h3 className="text-2xl font-bold text-black mb-4">
                     Description
                  </h3>
                  <p className="text-black/80 leading-relaxed text-base">
                     {script.description || "No description available for this script. Verified and tested by the Seisen Team."}
                  </p>
               </div>

               {/* Features */}
               <div className="mb-8">
                  <h3 className="text-2xl font-bold text-black mb-4">
                     Features
                  </h3>
                  
                  {script.features && script.features.length > 0 ? (
                     <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                           {script.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-black/80 text-sm">
                                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                              </li>
                           ))}
                        </ul>
                     </div>
                  ) : (
                     <div className="text-black/60 italic text-base">
                        Features list not available.
                     </div>
                  )}
               </div>
           </div>

           {/* Actions Fixed at Bottom */}
           <div className="p-6 border-t border-black/10">
              {script.status !== 'Discontinued' && (
                 <>
                   {script.type === 'Premium' && script.displayType !== 'Free & Premium' ? (
                       <Button className="w-full justify-center h-12 text-base bg-black text-white hover:bg-black/90" onClick={() => window.location.href = '/premium'}>
                          <Crown className="w-5 h-5 mr-2" />
                          Get Premium Access
                       </Button>
                   ) : (
                       <Button 
                          className={`w-full justify-center h-12 text-base transition-all ${copied ? 'bg-black/90' : 'bg-black'} text-white hover:bg-black/90`}
                          onClick={handleCopy}
                       >
                          {copied ? (
                             <>
                                <Check className="w-5 h-5 mr-2" />
                                Copied to Clipboard
                             </>
                          ) : (
                             <>
                                <Copy className="w-5 h-5 mr-2" />
                                Copy Loader Script
                             </>
                          )}
                       </Button>
                   )}
                 </>
              )}
              
              {script.status === 'Discontinued' && (
                 <Button variant="secondary" className="w-full opacity-50 cursor-not-allowed justify-center h-12">
                    Discontinued
                 </Button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
