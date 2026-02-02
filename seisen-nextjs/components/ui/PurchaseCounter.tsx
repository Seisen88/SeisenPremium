'use client';

import { Users } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function PurchaseCounter() {
  const [count, setCount] = useState<string>('15,420+'); // Default/Fallback

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/stats/purchases');
        const data = await res.json();
        if (data.formatted) {
          setCount(data.formatted);
        }
      } catch (err) {
        console.error('Failed to load purchase stats', err);
      }
    };

    fetchCount();
  }, []);

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-gray-400 bg-[#1a1a1a]/50 px-4 py-1.5 rounded-full border border-white/5 mx-auto w-fit mb-8 animate-fade-in">
      <Users className="w-4 h-4 text-emerald-500" />
      <span>
        <span className="text-white font-semibold">{count}</span> have purchased premium
      </span>
    </div>
  );
}
