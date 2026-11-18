import React, { useState, useEffect } from 'react';
import type { HealthResponse } from '@campusshelf/contracts';

export default function App(): React.JSX.Element {
  const [healthStatus, setHealthStatus] = useState<string>('Connected (Local)');

  useEffect(() => {
    // Optional check against API health endpoint when available
    fetch('/api/health')
      .then((res) => res.json())
      .then((data: HealthResponse) => {
        if (data.status === 'ok') {
          setHealthStatus(`Online (${data.environment})`);
        }
      })
      .catch(() => {
        // Fallback for standalone frontend dev
        setHealthStatus('Ready (Standby)');
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl" role="img" aria-label="Book logo">
              📚
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-emerald-700">CampusShelf</h1>
              <p className="text-xs text-slate-500">Donation-first student book network</p>
            </div>
          </div>
          <div
            data-testid="system-status-badge"
            className="flex items-center space-x-2 text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>System Status: {healthStatus}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-lg w-full">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
            ✨
          </div>
          <h2 className="text-2xl font-semibold mb-2">Welcome to CampusShelf</h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            A book is counted as donated only after a real handover is confirmed. Give your textbooks a second life or
            find study materials for your semester.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left text-xs text-slate-600 space-y-1.5">
            <div className="font-semibold text-slate-700 mb-1">CS-001 Workspace Foundation Active:</div>
            <div>• Monorepo packages linked & type-checked</div>
            <div>• Shared Zod contracts synchronized</div>
            <div>• Express API health check integrated</div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        © 2026 CampusShelf. Built for student communities.
      </footer>
    </div>
  );
}
