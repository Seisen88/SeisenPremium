'use client';

import { useState, useEffect } from 'react';
import { Code, Search, Copy, Check, Lock, Crown, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { copyToClipboard } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface Script {
  id: string;
  name: string;
  scriptUrl: string;
  status: 'Working' | 'Discontinued';
  type: string;
  universeId?: string;
  displayType?: string;
  additionalUrls?: { url: string; type: string }[];
}

interface ScriptsClientProps {
  initialScripts: Script[];
}

export default function ScriptsClient({ initialScripts }: ScriptsClientProps) {
  const [scripts, setScripts] = useState<Script[]>(initialScripts);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch thumbnails for games with universeId
    const fetchThumbnails = async () => {
      const universeIds = initialScripts
        .filter(s => s.universeId)
        .map(s => s.universeId)
        .join(',');
      
      if (!universeIds) return;

      // Processing in chunks to avoid URL length issues if many
      const chunks = initialScripts.reduce((acc, script) => {
        if (!script.universeId) return acc;
        if (acc.length === 0 || acc[acc.length - 1].length >= 100) {
          acc.push([script.universeId]);
        } else {
          acc[acc.length - 1].push(script.universeId);
        }
        return acc;
      }, [] as string[][]);

      for (const chunk of chunks) {
        try {
          const ids = chunk.join(',');
          const res = await fetch(`/api/proxy/thumbnails?universeIds=${ids}`);
          const data = await res.json();
          
          if (data.data) {
            setThumbnails(prev => {
              const newThumbs = { ...prev };
              data.data.forEach((item: any) => {
                newThumbs[item.targetId] = item.imageUrl;
              });
              return newThumbs;
            });
          }
        } catch (e) {
          console.error('Thumbnail fetch error:', e);
        }
      }
    };

    fetchThumbnails();
  }, [initialScripts]);

  const filteredScripts = scripts.filter((script) => {
    const matchesSearch =
      script.name.toLowerCase().includes(searchQuery.toLowerCase());

    const isPremium = script.type.toLowerCase().includes('premium') || script.displayType?.toLowerCase().includes('premium');
    
    // Logic: Free filter shows Free-only and Free/Premium. Premium filter shows Premium-only and Free/Premium.
    const matchesFilter =
      filter === 'all' ||
      (filter === 'free' && (script.type === 'Free' || script.displayType === 'Free & Premium')) ||
      (filter === 'premium' && (script.type === 'Premium' || script.displayType === 'Free & Premium'));

    return matchesSearch && matchesFilter;
  });

  const handleCopy = async (script: Script) => {
    // Universal loader for all free scripts as requested
    const textToCopy = `loadstring(game:HttpGet("https://api.junkie-development.de/api/v1/luascripts/public/8ac2e97282ac0718aeeb3bb3856a2821d71dc9e57553690ab508ebdb0d1569da/download"))()`;
    
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopiedId(script.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <section className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30">
            <Code className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Script Hub</h1>
          <p className="text-gray-500">
            Browse our collection of {initialScripts.length} premium and free scripts
          </p>
        </section>

        {/* Search and Filters */}
        <section className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search scripts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#141414] border border-[#2a2a2a] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            {(['all', 'free', 'premium'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-lg border transition-all capitalize ${
                  filter === f
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                    : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        {/* Scripts Grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScripts.map((script) => (
            <Card
              key={script.id}
              variant="hover"
              className="group overflow-hidden bg-[#101010] border-[#1f1f1f]"
            >
              {/* Thumbnail Area */}
              <div className="relative aspect-video bg-[#0a0a0a] overflow-hidden">
                {script.universeId && thumbnails[script.universeId] ? (
                  <Image
                    src={thumbnails[script.universeId]}
                    alt={script.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
                   <Code className="w-12 h-12 text-[#333]" />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                   <div className={`px-2 py-1 rounded-md text-xs font-bold shadow-lg ${
                     script.status === 'Discontinued' 
                       ? 'bg-red-500 text-white' 
                       : 'bg-emerald-500 text-white'
                   }`}>
                     {script.status}
                   </div>
                </div>
                
                {/* Type Badge */}
                <div className="absolute top-3 right-3">
                   {script.displayType === 'Free & Premium' ? (
                     <div className="px-2 py-1 bg-gradient-to-r from-blue-500 to-amber-500 rounded-md text-xs font-bold text-white shadow-lg flex items-center gap-1">
                       <Crown className="w-3 h-3" />
                       Free & Premium
                     </div>
                   ) : script.type === 'Premium' ? (
                     <div className="px-2 py-1 bg-amber-500 rounded-md text-xs font-bold text-white shadow-lg flex items-center gap-1">
                       <Crown className="w-3 h-3" />
                       Premium
                     </div>
                   ) : (
                     <div className="px-2 py-1 bg-blue-500 rounded-md text-xs font-bold text-white shadow-lg">
                       Free
                     </div>
                   )}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-4 line-clamp-1" title={script.name}>
                  {script.name}
                </h3>
                
                <div className="space-y-3">
                  {script.status === 'Discontinued' ? (
                     <Button variant="secondary" className="w-full opacity-50 cursor-not-allowed" disabled>
                       <Lock className="w-4 h-4" />
                       Discontinued
                     </Button>
                  ) : script.displayType === 'Free & Premium' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="secondary" className="w-full text-xs" onClick={() => handleCopy(script)}>
                        Copy Loader
                      </Button>
                      <Link href="/premium" className="w-full">
                        <Button variant="primary" className="w-full text-xs">
                          Buy Premium
                        </Button>
                      </Link>
                    </div>
                  ) : script.type === 'Premium' ? (
                    <Link href="/premium" className="block w-full">
                      <Button variant="primary" className="w-full">
                        <Crown className="w-4 h-4 mr-2" />
                        Buy Premium
                      </Button>
                    </Link>
                  ) : (
                     <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => handleCopy(script)}
                    >
                      {copiedId === script.id ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Loader
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </section>

        {filteredScripts.length === 0 && (
          <div className="text-center py-20 bg-[#101010] rounded-xl border border-[#1f1f1f]">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No scripts found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
