'use client';

import { useState } from 'react';
import { Lock, FileCode, CheckCircle, AlertCircle, Copy, Download, RefreshCw, Upload, Trash2, Settings, History } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getApiUrl, copyToClipboard } from '@/lib/utils';
import { version } from 'os';

type Preset = 'minify' | 'weak' | 'medium' | 'strong';
type LuaVersion = 'lua51' | 'luau';

const PRESETS = [
  { id: 'minify', name: 'Minify', description: 'Removes whitespace/comments' },
  { id: 'weak', name: 'Weak', description: 'Basic renaming & encoding' },
  { id: 'medium', name: 'Medium', description: 'Balanced protection' },
  { id: 'strong', name: 'Strong', description: 'Maximum security with VM' },
];

export default function ObfuscatorPage() {
  const [code, setCode] = useState('');
  const [obfuscatedCode, setObfuscatedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preset, setPreset] = useState<Preset>('strong');
  const [luaVersion, setLuaVersion] = useState<LuaVersion>('lua51');
  const [copied, setCopied] = useState(false);

  const handleObfuscate = async () => {
    if (!code.trim()) {
      setError('Please enter some Lua code first');
      return;
    }

    setLoading(true);
    setError(null);
    setObfuscatedCode('');

    try {
      const response = await fetch(`/api/obfuscate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          version: luaVersion,
          preset,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Obfuscation failed');
      }

      if (data.obfuscated) {
        setObfuscatedCode(data.obfuscated);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (obfuscatedCode) {
      await copyToClipboard(obfuscatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!obfuscatedCode) return;
    const blob = new Blob([obfuscatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `obfuscated_${Date.now()}.lua`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024 * 5) { // 5MB limit
      setError('File is too large (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setCode(text);
        setError(null);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-300 font-sans selection:bg-emerald-500/20">
      {/* Top IDE Header / Breadcrumbs */}
      <div className="h-14 border-b border-[#252525] bg-[#181818] flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
              <Lock className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white/90">Seisen Obfuscator</span>
          </div>

          <div className="h-4 w-[1px] bg-[#333] hidden md:block" />

          {/* Config Bar - Minimalist */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Lua Version</span>
              <div className="flex bg-[#0a0a0a] p-0.5 rounded-lg border border-[#333]">
                {(['lua51', 'luau'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setLuaVersion(v)}
                    className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                      luaVersion === v
                        ? 'bg-[#2d2d2d] text-emerald-400 shadow-sm'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {v === 'lua51' ? '5.1' : 'U'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Security</span>
              <div className="flex bg-[#0a0a0a] p-0.5 rounded-lg border border-[#333]">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPreset(p.id as Preset)}
                    className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                      preset === p.id
                        ? 'bg-[#2d2d2d] text-emerald-400 shadow-sm'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                    title={p.description}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            className="h-9 px-6 text-xs font-black tracking-widest uppercase rounded-lg shadow-lg shadow-emerald-500/10 group overflow-hidden transition-all hover:scale-105"
            onClick={handleObfuscate}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <Lock className="w-3 h-3 mr-2 group-hover:rotate-12 transition-transform" />
                <span>Protect</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 h-[calc(100vh-3.5rem)] overflow-hidden">
        
        {/* Input Editor Shell */}
        <div className="flex flex-col border-r border-[#252525] bg-[#1e1e1e]">
          {/* Tabs Bar */}
          <div className="h-9 bg-[#252526] flex items-center px-0">
            <div className="h-full px-4 border-r border-[#1e1e1e] bg-[#1e1e1e] text-white flex items-center gap-2 text-xs font-medium cursor-default">
              <FileCode className="w-3.5 h-3.5 text-orange-400" />
              <span>input.lua</span>
            </div>
            
            <div className="ml-auto flex items-center px-4 gap-4">
              <button
                onClick={() => setCode('local message = "Hello, Seisen!"\nprint(message)\n\nfor i = 1, 5 do\n    print("Count: " .. i)\nend')}
                className="text-[10px] font-bold text-emerald-500/80 hover:text-emerald-400 uppercase tracking-wider transition-colors"
                title="Populate with example code"
              >
                Try Example
              </button>
              <label className="cursor-pointer text-gray-500 hover:text-gray-300 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <input type="file" className="hidden" accept=".lua,.txt" onChange={handleFileUpload} />
              </label>
              {code && (
                <button onClick={() => setCode('')} className="text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Code Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* LInes gutter simulation */}
            <div className="w-12 bg-[#1e1e1e] pt-4 flex flex-col items-center text-[#858585] font-mono text-[11px] select-none border-r border-[#2d2d2d]/10">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="h-5 flex items-center">{i + 1}</div>
              ))}
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="-- Paste your Lua code here..."
              className="flex-1 p-4 bg-transparent text-[#d4d4d4] font-mono text-sm resize-none focus:outline-none scrollbar-thin scrollbar-thumb-white/10"
              spellCheck="false"
            />
          </div>

          {/* Error overlay - VS Code style popup */}
          {error && (
            <div className="absolute bottom-6 left-6 right-6 lg:right-auto lg:w-[480px] bg-[#252526] border border-[#333] shadow-2xl rounded-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-300 z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#333] bg-[#2d2d2d]">
                <div className="flex items-center gap-2 text-red-400 text-[10px] font-black uppercase tracking-widest">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Problem Detected</span>
                </div>
                <button onClick={() => setError(null)} className="text-gray-500 hover:text-white transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-red-400/90 font-mono text-[11px] leading-relaxed break-words whitespace-pre-wrap">
                  {error.split('stack traceback:')[0].trim()}
                </p>
                {error.includes('Parsing Error') && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-md p-2">
                    <p className="text-gray-400 text-[10px] leading-tight">
                      <span className="text-emerald-400 font-bold mr-1">Hint:</span>
                      Prometheus requires valid statements. Ensure your code isn't just a random string or incomplete fragment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Output Editor Shell */}
        <div className="flex flex-col bg-[#1e1e1e]">
          {/* Tabs Bar */}
          <div className="h-9 bg-[#252526] flex items-center px-0">
            <div className={`h-full px-4 border-r border-[#1e1e1e] flex items-center gap-2 text-xs font-medium cursor-default transition-all ${obfuscatedCode ? 'bg-[#1e1e1e] text-white' : 'bg-[#2d2d2d]/30 text-gray-500'}`}>
              <CheckCircle className={`w-3.5 h-3.5 ${obfuscatedCode ? 'text-emerald-400' : 'text-gray-600'}`} />
              <span>obfuscated.lua</span>
            </div>

            {obfuscatedCode && (
              <div className="ml-auto flex items-center px-4 gap-3 animate-fade-in">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 rounded text-[10px] font-bold bg-[#333] hover:bg-[#444] text-gray-300 transition-colors flex items-center gap-1.5"
                >
                  {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'COPIED' : 'COPY'}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1 rounded text-[10px] font-bold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3 h-3" />
                  SAVE
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 flex overflow-hidden relative">
            {/* LInes gutter simulation */}
            <div className="w-12 bg-[#1e1e1e] pt-4 flex flex-col items-center text-[#858585] font-mono text-[11px] select-none border-r border-[#2d2d2d]/10">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="h-5 flex items-center">{i + 1}</div>
              ))}
            </div>

            <textarea
              value={obfuscatedCode}
              readOnly
              placeholder={loading ? "-- Obfuscating script..." : "-- Result will appear here."}
              className={`flex-1 p-4 bg-transparent font-mono text-sm resize-none focus:outline-none scrollbar-thin scrollbar-thumb-white/10 ${obfuscatedCode ? 'text-emerald-400' : 'text-gray-600 italic'}`}
              spellCheck="false"
            />

            {!obfuscatedCode && !loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
                <Lock className="w-16 h-16 mb-4 text-gray-500" />
                <p className="text-sm font-bold tracking-widest uppercase text-gray-400">Ready to secure</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* VS Code Style Status Bar */}
      <div className="h-6 bg-emerald-600 flex items-center justify-between px-3 text-white text-[10px] font-medium uppercase tracking-wider">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 hover:bg-white/10 px-2 h-full transition-colors cursor-pointer">
            <RefreshCw className={`w-2.5 h-2.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Obfuscating...' : 'Ready'}</span>
          </div>
          <div className="flex items-center gap-1 hover:bg-white/10 px-2 h-full transition-colors cursor-pointer">
            <span>Encoding: UTF-8</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center px-2 h-full bg-black/10">
            <span>{preset} Mode</span>
          </div>
          <div className="flex items-center px-2 h-full bg-black/10">
            <span>{luaVersion === 'lua51' ? 'Lua 5.1' : 'LuaU'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
