'use client';

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

const loadingMessages = ['Loading...', 'Initializing...', 'Almost ready...', 'Welcome!'];

export default function LoadingScreen() {
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render anything during SSR to prevent hydration mismatch
  if (!isMounted) return null;

  return <LoadingScreenContent />;
}

function LoadingScreenContent() {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Check if already shown in session
    const hasShown = sessionStorage.getItem('seisen_loading_shown');
    if (hasShown) {
      setIsVisible(false);
      return;
    }

    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 30;
        
        // Update message based on progress
        if (next > 25 && messageIndex === 0) setMessageIndex(1);
        else if (next > 60 && messageIndex === 1) setMessageIndex(2);
        else if (next >= 90 && messageIndex === 2) setMessageIndex(3);

        if (next >= 100) {
          clearInterval(interval);
          sessionStorage.setItem('seisen_loading_shown', 'true');
          
          setTimeout(() => {
            setIsFading(true);
            setTimeout(() => setIsVisible(false), 500);
          }, 300);
          
          return 100;
        }
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [messageIndex]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a] transition-opacity duration-500 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center">
        {/* Logo */}
        <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 animate-pulse">
          <Zap className="w-8 h-8 text-white" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-6">Seisen</h2>

        {/* Progress Bar */}
        <div className="w-48 h-1 bg-[#1f1f1f] rounded-full overflow-hidden mx-auto mb-4">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading Text */}
        <p className="text-gray-500 text-sm">{loadingMessages[messageIndex]}</p>
      </div>
    </div>
  );
}
