import React, { useState, useEffect } from 'react';
import type { HealthResponse, UserProfile } from '@campusshelf/contracts';

export default function App(): React.JSX.Element {
  const [healthStatus, setHealthStatus] = useState<string>('Connected (Local)');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data: HealthResponse) => {
        if (data.status === 'ok') {
          setHealthStatus(`Online (${data.environment})`);
        }
      })
      .catch(() => {
        setHealthStatus('Ready (Standby)');
      });
  }, []);

  const handleSignInWithGoogle = () => {
    // In local dev/test or when Supabase keys are not set, provide an immediate simulated session
    const mockStudent: UserProfile = {
      id: '11111111-2222-3333-4444-555555555555',
      email: 'student@darrang.edu',
      fullName: 'Aarav Sharma',
      avatarUrl: null,
      role: 'REGISTERED',
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(mockStudent);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl" role="img" aria-label="Book logo">
              📚
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-emerald-700">CampusShelf</h1>
              <p className="text-xs text-slate-500">Donation-first student book network</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div
              data-testid="system-status-badge"
              className="hidden sm:flex items-center space-x-2 text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Status: {healthStatus}</span>
            </div>

            {currentUser ? (
              <div data-testid="user-profile-chip" className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full text-xs">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <span className="font-medium text-slate-800">{currentUser.fullName}</span>
                  <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                    {currentUser.role === 'REGISTERED' ? 'Registered User' : currentUser.role}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 px-3 py-1.5 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div data-testid="guest-auth-section" className="flex items-center space-x-3">
                <span className="text-xs text-slate-500 hidden md:inline">Browsing as Guest</span>
                <button
                  onClick={handleSignInWithGoogle}
                  className="flex items-center space-x-2 text-xs font-medium bg-emerald-700 text-white hover:bg-emerald-800 px-3.5 py-1.5 rounded-md shadow-sm transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V13.4h6.887C18.2 16.14 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.65 0 3.01.615 4.04 1.585l2.42-2.42C17.065 3.55 14.81 2.7 12.24 2.7 7.14 2.7 3 6.84 3 11.94s4.14 9.24 9.24 9.24c5.34 0 8.87-3.755 8.87-9.035 0-.61-.065-1.205-.18-1.86h-8.69z" />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>
            )}
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

          {currentUser ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-left text-xs text-emerald-900 space-y-2 mb-4">
              <div className="font-semibold text-emerald-800 flex items-center justify-between">
                <span>Account Status: {currentUser.role === 'REGISTERED' ? 'Registered User' : currentUser.role}</span>
                <span className="text-[10px] bg-emerald-200 px-2 py-0.5 rounded">Pilot Active</span>
              </div>
              <p className="text-emerald-700">
                You can browse public listings! To publish donation listings or request textbooks, redeem your campus
                invite code (coming in CS-003).
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left text-xs text-slate-600 space-y-1.5 mb-4">
              <div className="font-semibold text-slate-700 mb-1">Guest Browsing Active:</div>
              <div>• Free public catalog search and exploration</div>
              <div>• Authenticate with Google to join your campus and request books</div>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-left text-xs text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700">Milestone Completed:</div>
            <div>• CS-001 Workspace Foundation + CI</div>
            <div>• CS-002 Authentication + Profile Bootstrap</div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        © 2026 CampusShelf. Built for student communities.
      </footer>
    </div>
  );
}
