import React, { useState } from 'react';
import type { BookDriveSummary } from '@campusshelf/contracts';
import { QrCodeSvg } from './QrCodeSvg';

export interface BookDriveViewProps {
  drive: BookDriveSummary | null;
  isLoading?: boolean;
  onBrowseBooks: () => void;
  onDonateBook: () => void;
}

export const BookDriveView: React.FC<BookDriveViewProps> = ({
  drive,
  isLoading = false,
  onBrowseBooks,
  onDonateBook,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (isLoading) {
    return (
      <div data-testid="drive-loading-state" className="w-full max-w-4xl py-12 text-center text-slate-500">
        <div className="animate-spin text-3xl mb-3">🌀</div>
        <p className="text-xs">Loading campus semester book drive...</p>
      </div>
    );
  }

  if (!drive) {
    return (
      <div data-testid="drive-empty-state" className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 text-center my-8">
        <span className="text-3xl mb-2 block">📢</span>
        <h3 className="font-bold text-slate-800 text-base mb-1">Campus Book Drive Not Found</h3>
        <p className="text-xs text-slate-500 mb-4">
          The semester drive for this campus is either inactive or still being configured by campus ambassadors.
        </p>
        <button
          onClick={onBrowseBooks}
          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg"
        >
          Browse All Books
        </button>
      </div>
    );
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(drive.shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(drive.shareText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // Fallback
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  const whatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(drive.shareText)}`;

  return (
    <section data-testid="book-drive-view" className="w-full text-left space-y-8 max-w-5xl">
      {/* Hero Drive Banner */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <span>📢 Semester Book Drive</span>
            <span>•</span>
            <span>{drive.academicYear}</span>
            <span>•</span>
            <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-[10px]">Verified Handover Impact</span>
          </div>

          <h2 data-testid="drive-title" className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {drive.driveTitle}
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100/90 mt-2.5 leading-relaxed">
            Students passing reusable textbooks forward directly to junior and peer scholars on physical campus grounds.
            Free donations are prioritized over secondary sales.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={onBrowseBooks}
              data-testid="drive-browse-btn"
              className="bg-white hover:bg-emerald-50 text-emerald-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-colors flex items-center space-x-1.5"
            >
              <span>📖</span>
              <span>Find Study Books</span>
            </button>
            <button
              onClick={onDonateBook}
              data-testid="drive-donate-btn"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-colors flex items-center space-x-1.5"
            >
              <span>🎁</span>
              <span>Donate a Book</span>
            </button>
          </div>
        </div>

        {/* Aggregate Impact Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-8 pt-8 border-t border-emerald-700/60 relative z-10">
          <div data-testid="metric-books-donated" className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <div className="text-3xl sm:text-4xl font-black text-emerald-300">
              {drive.totalBooksDonated}
            </div>
            <div className="text-xs font-bold text-white mt-1">Textbooks Donated</div>
            <div className="text-[10px] text-emerald-200/80 mt-0.5">100% physically verified handovers</div>
          </div>

          <div data-testid="metric-contributors" className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <div className="text-3xl sm:text-4xl font-black text-teal-200">
              {drive.activeContributorsCount}
            </div>
            <div className="text-xs font-bold text-white mt-1">Campus Contributors</div>
            <div className="text-[10px] text-teal-200/80 mt-0.5">Students giving & circulating books</div>
          </div>

          <div data-testid="metric-books-listed" className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <div className="text-3xl sm:text-4xl font-black text-amber-200">
              {drive.totalBooksListed}
            </div>
            <div className="text-xs font-bold text-white mt-1">Total Books Shared</div>
            <div className="text-[10px] text-amber-200/80 mt-0.5">Across college departments</div>
          </div>
        </div>
      </div>

      {/* Top Academic Subjects */}
      {drive.topCategories && drive.topCategories.length > 0 && (
        <div data-testid="drive-top-categories" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3 flex items-center space-x-1.5">
            <span>📚</span>
            <span>Top Academic Departments in Drive</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {drive.topCategories.map((cat) => (
              <span
                key={cat.category}
                className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center space-x-1"
              >
                <span>{cat.category}:</span>
                <span className="font-extrabold text-emerald-950">{cat.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Campus Ambassador & Social Sharing Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Share Link & Tools */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
              <span>🚀 Campus Ambassador Tools</span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Share Drive with College Peer Groups</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Circulate textbooks before new semester classes kick off. Send the verified drive link to campus
              WhatsApp groups, departmental chats, and society forums.
            </p>
          </div>

          {/* Share Link Box */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Public Campaign URL</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={drive.shareUrl}
                data-testid="drive-share-url-input"
                className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 select-all"
              />
              <button
                onClick={handleCopyLink}
                data-testid="copy-share-link-btn"
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  copiedLink
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                }`}
              >
                {copiedLink ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Social Share CTAs */}
          <div className="pt-2 flex flex-wrap gap-2.5">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="share-whatsapp-btn"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors flex items-center space-x-2"
            >
              <span>💬</span>
              <span>Share to WhatsApp</span>
            </a>

            <button
              onClick={handleCopyText}
              data-testid="copy-share-text-btn"
              className={`text-xs font-bold px-4 py-2.5 rounded-xl border transition-colors flex items-center space-x-1.5 ${
                copiedText
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-300'
              }`}
            >
              <span>📋</span>
              <span>{copiedText ? '✓ Message Copied!' : 'Copy WhatsApp Message'}</span>
            </button>
          </div>

          {/* Share Text Preview */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">Pre-formatted message preview</div>
            <p className="text-xs text-slate-700 font-sans leading-relaxed italic">
              "{drive.shareText}"
            </p>
          </div>
        </div>

        {/* Right Column: Mobile-Optimized Share Card Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="text-xs font-bold text-slate-600 mb-2 flex items-center space-x-1">
            <span>📱</span>
            <span>Mobile Share Card Snapshot</span>
          </div>

          <div
            data-testid="drive-share-card"
            className="w-full max-w-[340px] bg-gradient-to-b from-emerald-900 via-teal-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border-2 border-emerald-600/30 text-center flex flex-col items-center justify-between space-y-4"
          >
            {/* Header */}
            <div>
              <div className="text-2xl mb-1">📚</div>
              <div className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">CampusShelf</div>
              <h4 className="text-base font-bold text-white mt-0.5">{drive.campusName}</h4>
              <p className="text-[10px] text-emerald-200/80">Semester Textbook Drive • {drive.academicYear}</p>
            </div>

            {/* Impact Badge */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl py-2 px-4 w-full border border-white/10">
              <div className="text-2xl font-black text-emerald-300">{drive.totalBooksDonated}</div>
              <div className="text-[10px] uppercase font-bold text-white tracking-wide">Books Circulated</div>
            </div>

            {/* QR Code */}
            <div className="bg-white p-2 rounded-2xl shadow-inner">
              <QrCodeSvg value={drive.shareUrl} size={130} />
            </div>

            <div className="text-[10px] text-emerald-200/90 font-medium">
              Scan with phone camera to donate or request textbooks
            </div>

            <div className="w-full pt-2 border-t border-white/10 text-[9px] text-slate-400 truncate">
              {drive.shareUrl}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Guardrail Banner */}
      <div
        data-testid="drive-privacy-guardrail"
        className="bg-slate-100 border border-slate-200 text-slate-600 text-xs p-4 rounded-2xl flex items-center space-x-3"
      >
        <span className="text-xl shrink-0">🔒</span>
        <div className="leading-relaxed">
          <span className="font-bold text-slate-800">Privacy Guardrail: </span>
          Public semester drive pages render only aggregated counts and verified impact.
          No student names, mobile numbers, or personal contact details are ever published on shareable campaign pages.
        </div>
      </div>
    </section>
  );
};
