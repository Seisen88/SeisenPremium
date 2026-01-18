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

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Controls Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 space-y-6 sticky top-24">
              <div className="flex items-center gap-2 text-lg font-bold text-white pb-4 border-b border-[#2a2a2a]">
                <Settings className="w-5 h-5 text-emerald-500" />
                Configuration
              </div>

              {/* Lua Version */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-400">Lua Version</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['lua51', 'luau'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setLuaVersion(v)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        luaVersion === v
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
                          : 'bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#222]'
                      }`}
                    >
                      {v === 'lua51' ? 'Lua 5.1' : 'LuaU'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Presets */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-400">Security Level</label>
                <div className="space-y-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPreset(p.id as Preset)}
                      className={`w-full p-3 rounded-lg text-left transition-all border ${
                        preset === p.id
                          ? 'bg-emerald-500/10 border-emerald-500/50'
                          : 'bg-[#1a1a1a] border-transparent hover:border-[#333]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`font-semibold ${preset === p.id ? 'text-emerald-500' : 'text-gray-300'}`}>
                          {p.name}
                        </span>
                        {preset === p.id && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <p className="text-xs text-gray-500">{p.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="pt-4">
                <Button 
                  className="w-full h-12 text-lg font-bold shadow-lg shadow-emerald-900/20"
                  onClick={handleObfuscate}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Protecting...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Obfuscate Code
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Editors */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Input Editor */}
            <Card className="flex flex-col h-[500px] overflow-hidden border-[#2a2a2a] bg-[#0a0a0a]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a] bg-[#111]">
                <div className="flex items-center gap-2 text-gray-400">
                  <FileCode className="w-4 h-4" />
                  <span className="text-sm font-medium">Input Code</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 rounded-md bg-[#1a1a1a] hover:bg-[#222] text-xs text-gray-300 transition-colors flex items-center gap-2">
                    <Upload className="w-3 h-3" />
                    Upload File
                    <input type="file" className="hidden" accept=".lua,.txt" onChange={handleFileUpload} />
                  </label>
                  {code && (
                    <button 
                      onClick={() => setCode('')}
                      className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
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
                className="flex-1 w-full p-4 bg-[#0a0a0a] text-gray-300 font-mono text-sm resize-none focus:outline-none"
                spellCheck="false"
              />
            </Card>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-500 text-sm">Obfuscation Failed</h4>
                  <p className="text-red-400 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Output Editor */}
            {obfuscatedCode && (
              <Card className="flex flex-col h-[500px] overflow-hidden border-emerald-500/30 bg-[#0a0a0a] shadow-lg shadow-emerald-900/10 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a] bg-[#111]">
                  <div className="flex items-center gap-2 text-emerald-500">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-bold">Obfuscated Output</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={handleCopy}>
                      {copied ? <CheckCircle className="w-3 h-3 mr-2" /> : <Copy className="w-3 h-3 mr-2" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button size="sm" onClick={handleDownload}>
                      <Download className="w-3 h-3 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <textarea
                  value={obfuscatedCode}
                  readOnly
                  className="flex-1 w-full p-4 bg-[#0a0a0a] text-emerald-400 font-mono text-sm resize-none focus:outline-none"
                  spellCheck="false"
                />
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
