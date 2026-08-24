import React, { useState, useEffect } from 'react';
import { Terminal, Copy, Check, Play, Database, Layers, Server, Code2, ShieldCheck, Zap, Globe, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export const SpringBootArchitectureView: React.FC = () => {
  const [docsData, setDocsData] = useState<any>(null);
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  // Live REST API tester state
  const [testEndpoint, setTestEndpoint] = useState('/api/v1/products');
  const [testMethod, setTestMethod] = useState('GET');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      const data = await api.getSpringBootDocs();
      setDocsData(data);
    } catch (err) {
      console.error('Failed to load springboot docs:', err);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunTest = async () => {
    try {
      setTesting(true);
      const res = await fetch(testEndpoint);
      const data = await res.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setTestResult(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setTesting(false);
    }
  };

  const activeFile = docsData?.files?.[selectedFileIdx];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200">
          <Terminal className="w-3.5 h-3.5" />
          <span>Spring Boot 3.3.x & PostgreSQL Architecture Blueprint</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
          Enterprise Backend Architecture
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-2xl mx-auto">
          Explore the clean, modular Controller-Service-Repository architecture, JPA entity mappings,
          and live REST endpoints connected directly to Supabase PostgreSQL.
        </p>
      </div>

      {/* Architecture Visual Diagram */}
      <div className="bg-zinc-900 text-white rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
            System Request Flow & Layer Separation
          </span>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300 font-mono">
            Clean Architecture Pattern
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Layer 1 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
              <Globe className="w-4 h-4" />
              <span>React Client</span>
            </div>
            <div className="text-[11px] text-zinc-400">
              Vite, Tailwind, TypeScript SPA issuing REST fetch requests
            </div>
          </div>

          {/* Layer 2 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
              <Server className="w-4 h-4" />
              <span>@RestController</span>
            </div>
            <div className="text-[11px] text-zinc-400">
              Handles HTTP routing, request validation, serialization
            </div>
          </div>

          {/* Layer 3 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Zap className="w-4 h-4" />
              <span>@Service Layer</span>
            </div>
            <div className="text-[11px] text-zinc-400">
              Business logic, inventory check, discounts & transactions
            </div>
          </div>

          {/* Layer 4 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Database className="w-4 h-4" />
              <span>Supabase PostgreSQL</span>
            </div>
            <div className="text-[11px] text-zinc-400">
              Postgres 15+, persistent tables, relations & foreign keys
            </div>
          </div>
        </div>
      </div>

      {/* Code Viewer & Tabs */}
      <div className="bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-zinc-800 overflow-x-auto">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {docsData?.files?.map((file: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedFileIdx(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
                  selectedFileIdx === idx
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{file.fileName}</span>
              </button>
            ))}
          </div>

          {activeFile && (
            <button
              onClick={() => handleCopyCode(activeFile.code)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition shrink-0 ml-2"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>

        {/* File Description Header */}
        {activeFile && (
          <div className="px-6 py-3 bg-zinc-900/40 border-b border-zinc-800/80 text-xs text-zinc-400 flex items-center justify-between">
            <span>{activeFile.description}</span>
            <span className="font-mono text-[10px] text-indigo-400 uppercase">{activeFile.language}</span>
          </div>
        )}

        {/* Code Content */}
        <div className="p-6 overflow-x-auto max-h-[480px] font-mono text-xs text-zinc-300 leading-relaxed">
          <pre>
            <code>{activeFile?.code}</code>
          </pre>
        </div>
      </div>

      {/* Interactive REST API Sandbox */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              Live REST API Playground (Supabase Backend)
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Execute live HTTP queries against the backend and verify PostgreSQL data responses
            </p>
          </div>
        </div>

        {/* Endpoint Selector Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={testEndpoint}
            onChange={(e) => setTestEndpoint(e.target.value)}
            className="text-xs font-mono font-semibold p-2.5 rounded-xl border border-zinc-300 bg-zinc-50 outline-none"
          >
            <option value="/api/v1/products">GET /api/v1/products (Catalog List)</option>
            <option value="/api/v1/products/prod-1">GET /api/v1/products/prod-1 (Single Item + Reviews)</option>
            <option value="/api/v1/categories">GET /api/v1/categories (Categories)</option>
            <option value="/api/v1/orders">GET /api/v1/orders (Orders list)</option>
            <option value="/api/v1/system/status">GET /api/v1/system/status (Database Health)</option>
          </select>

          <button
            onClick={handleRunTest}
            disabled={testing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{testing ? 'Executing...' : 'Send Request'}</span>
          </button>
        </div>

        {/* Test Result Output */}
        {testResult && (
          <div className="p-4 rounded-2xl bg-zinc-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-64 border border-zinc-800">
            <pre>{testResult}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
