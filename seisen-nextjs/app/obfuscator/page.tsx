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
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/obfuscate`, {
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
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <section className="text-center animate-fade-in space-y-4">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/30">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Lua Obfuscator</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Protect your Lua scripts with our advanced obfuscation engine. Supports Lua 5.1 and LuaU.
          </p>
        </section>

        {/* Main Content */}
        <div className="space-y-8">
          
          {/* Configuration - Now at the Top */}
          <Card className="p-6 border-[#2a2a2a] bg-[#0d0d0d]/80 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
              <div className="flex flex-wrap gap-8 items-center">
                {/* Lua Version */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Lua Version</label>
                  <div className="flex gap-2">
                    {(['lua51', 'luau'] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => setLuaVersion(v)}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                          luaVersion === v
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                            : 'bg-[#1a1a1a] text-gray-500 hover:text-white hover:bg-[#222] border border-transparent hover:border-[#333]'
                        }`}
                      >
                        {v === 'lua51' ? 'Lua 5.1' : 'LuaU'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hidden md:block w-px h-12 bg-[#2a2a2a]" />

                {/* Security Level */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Security Level</label>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPreset(p.id as Preset)}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                          preset === p.id
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                            : 'bg-[#1a1a1a] text-gray-500 hover:text-white hover:bg-[#222] border border-transparent hover:border-[#333]'
                        }`}
                        title={p.description}
                      >
                        {p.name}
                        {preset === p.id && <CheckCircle className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="w-full md:w-auto">
                <Button 
                  className="w-full md:px-10 h-14 text-lg font-black tracking-wide shadow-xl shadow-emerald-500/20 rounded-2xl group relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleObfuscate}
                  disabled={loading}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-10 transition-opacity" />
                  {loading ? (
                    <>
                      <RefreshCw className="w-6 h-6 mr-3 animate-spin text-emerald-200" />
                      <span className="bg-gradient-to-r from-emerald-100 to-white bg-clip-text text-transparent">Protecting...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                      <span>Obfuscate Code</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-red-500">Obfuscation Failed</h4>
                <p className="text-red-400/80 text-sm leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Editors Grid */}
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Input Editor */}
            <Card className="flex flex-col h-[600px] overflow-hidden border-[#2a2a2a] bg-[#0a0a0a] group focus-within:border-emerald-500/30 transition-colors rounded-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a] bg-[#111]/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold tracking-tight text-white">Input Code</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-[#1a1a1a] hover:bg-[#222] text-xs font-bold text-gray-300 transition-all border border-transparent hover:border-[#333] flex items-center gap-2 group/upload">
                    <Upload className="w-3 h-3 group-hover/upload:-translate-y-0.5 transition-transform" />
                    Upload File
                    <input type="file" className="hidden" accept=".lua,.txt" onChange={handleFileUpload} />
                  </label>
                  {code && (
                    <button 
                      onClick={() => setCode('')}
                      className="p-2 text-gray-500 hover:text-red-400 transition-all rounded-xl hover:bg-red-500/10"
                      title="Clear"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="-- Paste your Lua code here..."
                className="flex-1 w-full p-6 bg-[#0a0a0a] text-gray-300 font-mono text-sm resize-none focus:outline-none scrollbar-thin scrollbar-thumb-[#222] scrollbar-track-transparent selection:bg-emerald-500/20"
                spellCheck="false"
              />
            </Card>

            {/* Output Editor */}
            <Card className={`flex flex-col h-[600px] overflow-hidden transition-all duration-700 rounded-2xl border-[#2a2a2a] ${obfuscatedCode ? 'border-emerald-500/30 bg-[#0a0a0a] shadow-[0_0_50px_rgba(16,185,129,0.05)]' : 'bg-[#0d0d0d] opacity-50'}`}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a] bg-[#111]/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${obfuscatedCode ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-800 text-gray-500'}`}>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className={`text-sm font-bold tracking-tight ${obfuscatedCode ? 'text-white' : 'text-gray-500'}`}>
                    {obfuscatedCode ? 'Obfuscated Result' : 'Output Awaiting...'}
                  </span>
                </div>
                {obfuscatedCode && (
                  <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-500">
                    <Button size="sm" variant="secondary" onClick={handleCopy} className="h-9 px-4 rounded-xl font-bold bg-[#1a1a1a] border-[#333] border hover:bg-[#222] text-gray-300">
                      {copied ? <CheckCircle className="w-3 h-3 mr-2" /> : <Copy className="w-3 h-3 mr-2 text-emerald-500" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button size="sm" onClick={handleDownload} className="h-9 px-4 rounded-xl font-bold">
                      <Download className="w-3 h-3 mr-2" />
                      Save File
                    </Button>
                  </div>
                )}
              </div>
              <textarea
                value={obfuscatedCode}
                readOnly
                placeholder={loading ? "-- Obfuscating in progress..." : "-- Obfuscated code will appear here."}
                className={`flex-1 w-full p-6 font-mono text-sm resize-none focus:outline-none scrollbar-thin scrollbar-thumb-[#222] scrollbar-track-transparent ${obfuscatedCode ? 'text-emerald-400 bg-[#0a0a0a]' : 'text-gray-600 bg-transparent opacity-30 cursor-not-allowed'}`}
                spellCheck="false"
              />
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
