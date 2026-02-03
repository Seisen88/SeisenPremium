'use client';

import { useState, useEffect } from 'react';
import { Code, Search, Copy, Check, Lock, Crown, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import TiltCard from '@/components/ui/TiltCard';
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
          <h1 className="text-lg font-bold text-white mb-2">Script Hub</h1>
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
        <section className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredScripts.map((script) => (
            <TiltCard key={script.id}>
              <Card
                variant="hover"
                className="group relative overflow-hidden bg-[#101010] border-[#1f1f1f] cursor-pointer h-64"
                onClick={() => {
                  if (script.status === 'Discontinued') return;
                  if (script.type === 'Premium' && script.displayType !== 'Free & Premium') {
                    window.location.href = '/premium';
                  } else {
                    handleCopy(script);
                  }
                }}
              >
                {/* Full Image Background */}
                {script.universeId && thumbnails[script.universeId] ? (
                  <Image
                    src={thumbnails[script.universeId]}
                    alt={script.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
                    <Code className="w-16 h-16 text-[#333]" />
                  </div>
                )}

                {/* Overlay Gradient - Stronger for better text visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                {/* Name Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                  <div className="flex items-center gap-2 mb-1">
                    {script.status === 'Working' ? (
                      <div className="relative flex-shrink-0">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                        <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                      </div>
                    ) : (
                      <div className="relative flex-shrink-0">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                        <div className="absolute inset-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping opacity-75"></div>
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-white drop-shadow-md">
                      {script.name}
                    </h3>
                  </div>
                   {copiedId === script.id && (
                     <div className="text-emerald-400 text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                       <Check className="w-4 h-4" />
                       Loader Copied!
                     </div>
                   )}
                </div>
              </Card>
            </TiltCard>
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
