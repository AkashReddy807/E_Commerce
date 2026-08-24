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
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#999999]">
          Enterprise Architecture Blueprint
        </div>
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#111111]">
          Spring Boot 3.3.x & PostgreSQL
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] max-w-2xl mx-auto leading-relaxed">
          Explore the Controller-Service-Repository architecture, JPA entity mappings, and live REST endpoints connected directly to Supabase PostgreSQL.
        </p>
      </div>

      {/* Architecture Visual Diagram */}
      <div className="bg-[#ffffff] text-[#111111] p-6 sm:p-8 border border-[#f0f0f0] space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#f0f0f0]">
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#999999]">
            System Request Flow & Layer Separation
          </span>
          <span className="text-[10px] uppercase tracking-widest font-mono text-[#111111] px-2 py-0.5 border border-[#e5e5e5]">
            Layered Architecture
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Layer 1 */}
          <div className="p-4 bg-[#fafafa] border border-[#f0f0f0] space-y-2">
            <div className="flex items-center gap-2 text-[#111111] font-medium text-xs uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>React Client</span>
            </div>
            <div className="text-[11px] text-[#666666] leading-relaxed">
              Vite, Tailwind, TypeScript SPA issuing REST requests
            </div>
          </div>

          {/* Layer 2 */}
          <div className="p-4 bg-[#fafafa] border border-[#f0f0f0] space-y-2">
            <div className="flex items-center gap-2 text-[#111111] font-medium text-xs uppercase tracking-wider">
              <Server className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>@RestController</span>
            </div>
            <div className="text-[11px] text-[#666666] leading-relaxed">
              HTTP routing, request validation, payload serialization
            </div>
          </div>

          {/* Layer 3 */}
          <div className="p-4 bg-[#fafafa] border border-[#f0f0f0] space-y-2">
            <div className="flex items-center gap-2 text-[#111111] font-medium text-xs uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>@Service Layer</span>
            </div>
            <div className="text-[11px] text-[#666666] leading-relaxed">
              Business logic, inventory check, discounts & transactions
            </div>
          </div>

          {/* Layer 4 */}
          <div className="p-4 bg-[#fafafa] border border-[#f0f0f0] space-y-2">
            <div className="flex items-center gap-2 text-[#111111] font-medium text-xs uppercase tracking-wider">
              <Database className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>PostgreSQL</span>
            </div>
            <div className="text-[11px] text-[#666666] leading-relaxed">
              Supabase cloud instance, relational schema & foreign keys
            </div>
          </div>
        </div>
      </div>

      {/* Code Viewer & Tabs */}
      <div className="bg-[#111111] text-[#f0f0f0] border border-[#333333] overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] border-b border-[#333333] overflow-x-auto">
          <div className="flex items-center gap-1 overflow-x-auto">
            {docsData?.files?.map((file: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedFileIdx(idx)}
                className={`px-3 py-1.5 text-xs font-mono transition flex items-center gap-1.5 whitespace-nowrap ${
                  selectedFileIdx === idx
                    ? 'bg-[#ffffff] text-[#111111] font-semibold'
                    : 'text-[#999999] hover:text-white hover:bg-[#262626]'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>{file.fileName}</span>
              </button>
            ))}
          </div>

          {activeFile && (
            <button
              onClick={() => handleCopyCode(activeFile.code)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#444444] hover:border-white text-xs text-[#cccccc] hover:text-white transition shrink-0 ml-2"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white stroke-[2]" /> : <Copy className="w-3.5 h-3.5 stroke-[1.5]" />}
              <span className="uppercase text-[10px] tracking-wider">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>

        {/* File Description Header */}
        {activeFile && (
          <div className="px-6 py-2.5 bg-[#141414] border-b border-[#262626] text-xs text-[#999999] flex items-center justify-between">
            <span>{activeFile.description}</span>
            <span className="font-mono text-[10px] text-[#cccccc] uppercase tracking-wider">{activeFile.language}</span>
          </div>
        )}

        {/* Code Content */}
        <div className="p-6 overflow-x-auto max-h-[480px] font-mono text-xs text-[#e5e5e5] leading-relaxed">
          <pre>
            <code>{activeFile?.code}</code>
          </pre>
        </div>
      </div>

      {/* Interactive REST API Sandbox */}
      <div className="bg-[#ffffff] border border-[#f0f0f0] p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#111111] flex items-center gap-2">
              <Play className="w-3.5 h-3.5 stroke-[1.5]" />
              Live REST API Playground (Supabase Backend)
            </h3>
            <p className="text-xs text-[#666666] mt-1">
              Execute live HTTP queries against the backend and verify PostgreSQL data responses.
            </p>
          </div>
        </div>

        {/* Endpoint Selector Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={testEndpoint}
            onChange={(e) => setTestEndpoint(e.target.value)}
            className="text-xs font-mono p-2.5 border border-[#e5e5e5] bg-[#fafafa] outline-none flex-1 focus:border-[#111111]"
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
            className="bg-[#111111] hover:bg-[#333333] text-white text-xs uppercase tracking-widest font-medium px-5 py-2.5 transition flex items-center justify-center gap-2 disabled:bg-[#999999]"
          >
            <Play className="w-3 h-3 stroke-[1.5]" />
            <span>{testing ? 'Executing...' : 'Execute Request'}</span>
          </button>
        </div>

        {/* Test Result Output */}
        {testResult && (
          <div className="p-4 bg-[#111111] text-[#fafafa] font-mono text-xs overflow-x-auto max-h-64 border border-[#333333]">
            <pre>{testResult}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

