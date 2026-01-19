'use client';

import { useState, useEffect } from 'react';
import { Lock, FileCode, CheckCircle, AlertCircle, Copy, Download, RefreshCw, Upload, Trash2, RotateCcw } from 'lucide-react';
import Button from '@/components/ui/Button';
import { copyToClipboard } from '@/lib/utils';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-lua';
import 'prismjs/themes/prism-tomorrow.css';

type Preset = 'Minify' | 'Weak' | 'Medium' | 'Strong';
type LuaVersion = 'lua51' | 'luau';

const PRESETS = [
  { id: 'Minify', name: 'Minify', description: 'Removes whitespace/comments' },
  { id: 'Weak', name: 'Weak', description: 'Basic renaming & encoding' },
  { id: 'Medium', name: 'Medium', description: 'Balanced protection' },
  { id: 'Strong', name: 'Strong', description: 'Maximum security with VM' },
];

export default function ObfuscatorPage() {
  const [code, setCode] = useState('');
  const [obfuscatedCode, setObfuscatedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preset, setPreset] = useState<Preset>('Strong');
  const [luaVersion, setLuaVersion] = useState<LuaVersion>('lua51');
  const [fileName, setFileName] = useState('obfuscated_script');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .custom-editor .token.comment { color: #6a9955 !important; font-style: italic; }
      .custom-editor .token.string { color: #ce9178 !important; }
      .custom-editor .token.keyword { color: #c586c0 !important; font-weight: bold; }
      .custom-editor .token.function { color: #dcdcaa !important; }
      .custom-editor .token.number { color: #b5cea8 !important; }
      .custom-editor .token.operator { color: #d4d4d4 !important; }
      .custom-editor .token.punctuation { color: #808080 !important; }
      .custom-editor .token.boolean { color: #569cd6 !important; }
      .custom-editor .token.builtin { color: #4ec9b0 !important; }
      .custom-editor .token.constant { color: #4fc1ff !important; }
      .custom-editor textarea { outline: none !important; }
    `;
    document.head.appendChild(style);
    return () => { if (document.head.contains(style)) document.head.removeChild(style); };
  }, []);

  const handleReset = () => {
    setCode('');
    setObfuscatedCode('');
    setError(null);
  };

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
    a.download = `${fileName.endsWith('.lua') ? fileName : fileName + '.lua'}`;
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
    <div className="h-screen bg-[#0d0d0d] text-gray-300 font-sans selection:bg-emerald-500/20 flex flex-col overflow-hidden">
      {/* Top IDE Header */}
      <div className="h-12 border-b border-[#252525] bg-[#181818] flex items-center justify-between px-4 sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-6 h-6 flex items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold tracking-tight text-white/90">Seisen Obfuscator</span>
          </div>

          <div className="h-4 w-[1px] bg-[#333] hidden md:block" />

          {/* Config Bar */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest">Version</span>
              <div className="flex bg-[#0a0a0a] p-0.5 rounded-md border border-[#333]">
                {(['lua51', 'luau'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setLuaVersion(v)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      luaVersion === v ? 'bg-[#2d2d2d] text-emerald-400' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {v === 'lua51' ? '5.1' : 'U'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest">Security</span>
              <div className="flex bg-[#0a0a0a] p-0.5 rounded-md border border-[#333]">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPreset(p.id as Preset)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      preset === p.id ? 'bg-[#2d2d2d] text-emerald-400' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-400 text-[10px] font-bold transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET</span>
          </button>
          <Button 
            className="h-7 px-4 text-[10px] font-black tracking-widest uppercase rounded shadow-lg shadow-emerald-500/10 transition-all hover:scale-105"
            onClick={handleObfuscate}
            disabled={loading}
          >
            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>PROTECT</span>}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 flex-1 overflow-hidden">
        {/* Input */}
        <div className="flex flex-col border-r border-[#252525] bg-[#1e1e1e] relative">
          <div className="h-9 bg-[#252526] flex items-center px-0 shrink-0">
            <div className="h-full px-4 bg-[#1e1e1e] text-white flex items-center gap-2 text-xs font-medium border-r border-[#1e1e1e]">
              <FileCode className="w-3.5 h-3.5 text-orange-400" />
              <span>input.lua</span>
            </div>
            <div className="ml-auto flex items-center px-4 gap-4">
              <button
                onClick={() => setCode('local message = "Hello, Seisen!"\nprint(message)\n\nfor i = 1, 5 do\n    print("Count: " .. i)\nend')}
                className="text-[9px] font-black text-emerald-500/80 hover:text-emerald-400 uppercase tracking-widest transition-colors"
              >
                Try Example
              </button>
              <label className="cursor-pointer text-gray-500 hover:text-gray-300 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <input type="file" className="hidden" accept=".lua,.txt" onChange={handleFileUpload} />
              </label>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex">
            {/* Gutter */}
            <div className="w-10 bg-[#1e1e1e] pt-4 flex flex-col items-center text-[#858585] font-mono text-[10px] select-none border-r border-[#2d2d2d]/10 shrink-0 overflow-hidden">
              <div className="animate-in fade-in duration-500">
                {Array.from({ length: 100 }).map((_, i) => (
                  <div key={i} className="h-5 flex items-center">{i + 1}</div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-editor scrollbar-thin scrollbar-thumb-white/10">
              <Editor
                value={code}
                onValueChange={setCode}
                highlight={code => Prism.highlight(code, Prism.languages.lua, 'lua')}
                padding={16}
                style={{ 
                  fontFamily: '"Fira Code", monospace', 
                  fontSize: 13,
                  minHeight: '100%',
                }}
                className="focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="absolute bottom-4 left-4 right-4 bg-[#252526] border border-red-500/20 shadow-2xl rounded p-3 z-50">
              <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase mb-2">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Problem Detected</span>
              </div>
              <p className="text-red-400/90 font-mono text-[10px] leading-relaxed break-words">{error}</p>
            </div>
          )}
        </div>

        {/* Output */}
        <div className="flex flex-col bg-[#1e1e1e]">
          <div className="h-9 bg-[#252526] flex items-center px-0 shrink-0">
            <div className={`h-full px-4 flex items-center gap-2 text-xs font-medium transition-all ${obfuscatedCode ? 'bg-[#1e1e1e] text-white' : 'bg-[#2d2d2d]/30 text-gray-500'}`}>
              <CheckCircle className={`w-3.5 h-3.5 ${obfuscatedCode ? 'text-emerald-400' : 'text-gray-600'}`} />
              <span>obfuscated.lua</span>
            </div>
            {obfuscatedCode && (
              <div className="ml-auto flex items-center px-4 gap-2">
                <button
                  onClick={handleCopy}
                  className="px-2 py-1 rounded text-[10px] font-bold bg-[#333] hover:bg-[#444] text-gray-300 flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? 'COPIED' : 'COPY'}
                </button>
                <div className="flex items-center gap-1 p-0.5 bg-[#0a0a0a] rounded border border-[#333]">
                  <input 
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="bg-transparent border-none outline-none text-[10px] font-medium text-gray-300 w-20 px-1 focus:ring-0"
                  />
                  <button onClick={handleDownload} className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors">
                    SAVE
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-hidden flex relative">
            <div className="w-10 bg-[#1e1e1e] pt-4 flex flex-col items-center text-[#858585] font-mono text-[10px] select-none border-r border-[#2d2d2d]/10 shrink-0 overflow-hidden">
              <div className="animate-in fade-in duration-500">
                {Array.from({ length: 100 }).map((_, i) => (
                  <div key={i} className="h-5 flex items-center">{i + 1}</div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-editor scrollbar-thin scrollbar-thumb-white/10">
              <Editor
                value={obfuscatedCode}
                onValueChange={() => {}}
                highlight={code => Prism.highlight(code, Prism.languages.lua, 'lua')}
                padding={16}
                readOnly
                style={{ 
                  fontFamily: '"Fira Code", monospace', 
                  fontSize: 13,
                  minHeight: '100%',
                }}
                className="focus:outline-none"
              />
              {!obfuscatedCode && !loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
                  <Lock className="w-10 h-10 mb-2 text-gray-500" />
                  <p className="text-[9px] font-black tracking-widest uppercase text-gray-500">Ready</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="h-5 bg-emerald-600 flex items-center justify-between px-3 text-white text-[9px] font-bold uppercase shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <RefreshCw className={`w-2 h-2 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Processing...' : 'Ready'}</span>
          </div>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{preset}</span>
          <span>{luaVersion === 'lua51' ? 'Lua 5.1' : 'LuaU'}</span>
        </div>
      </div>
    </div>
  );
}
