import React, { useState } from 'react';
import type {
  PartnerOrganization,
  CreatePartnerInput,
  ReviewPartnerInput,
  PartnerType,
} from '@campusshelf/contracts';

interface PartnerDirectoryProps {
  partners: PartnerOrganization[];
  allAdminPartners?: PartnerOrganization[];
  isAdmin?: boolean;
  onOnboardPartner?: (input: CreatePartnerInput) => Promise<PartnerOrganization | void>;
  onReviewPartner?: (id: string, review: ReviewPartnerInput) => Promise<PartnerOrganization | void>;
}

const DEFAULT_ONBOARD_FORM: CreatePartnerInput = {
  name: '',
  type: 'NGO',
  description: '',
  contactEmail: '',
  website: '',
  contactPhone: '',
  address: '',
};

export const PartnerDirectory: React.FC<PartnerDirectoryProps> = ({
  partners,
  allAdminPartners = [],
  isAdmin = false,
  onOnboardPartner,
  onReviewPartner,
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'admin'>('directory');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Public partner profile detail modal state
  const [selectedPartnerForDetail, setSelectedPartnerForDetail] = useState<PartnerOrganization | null>(null);

  // Onboard modal state
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [onboardForm, setOnboardForm] = useState<CreatePartnerInput>(DEFAULT_ONBOARD_FORM);
  const [onboardError, setOnboardError] = useState<string | null>(null);
  const [isOnboarding, setIsOnboarding] = useState(false);

  // Review modal state
  const [reviewingPartner, setReviewingPartner] = useState<PartnerOrganization | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Filter public directory
  const filteredPublicPartners = partners.filter((p) => {
    // Only verified partners in public directory view
    if (p.verificationStatus !== 'VERIFIED') return false;

    if (selectedType !== 'ALL' && p.type !== selectedType) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = p.name.toLowerCase().includes(q);
      const matchesDesc = p.description.toLowerCase().includes(q);
      const matchesCampus = p.campusName?.toLowerCase().includes(q);
      if (!matchesName && !matchesDesc && !matchesCampus) return false;
    }

    return true;
  });

  const handleOpenOnboard = () => {
    setOnboardForm(DEFAULT_ONBOARD_FORM);
    setOnboardError(null);
    setIsOnboardModalOpen(true);
  };

  const handleSubmitOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onOnboardPartner) return;

    if (!onboardForm.name.trim() || !onboardForm.description.trim() || !onboardForm.contactEmail.trim()) {
      setOnboardError('Name, description, and contact email are required.');
      return;
    }

    try {
      setIsOnboarding(true);
      setOnboardError(null);
      await onOnboardPartner(onboardForm);
      setIsOnboardModalOpen(false);
    } catch (err: any) {
      setOnboardError(err.message || 'Failed to onboard partner organization.');
    } finally {
      setIsOnboarding(false);
    }
  };

  const handleOpenReview = (partner: PartnerOrganization) => {
    setReviewingPartner(partner);
    setReviewNotes(partner.adminReviewNotes || '');
    setReviewError(null);
  };

  const handlePerformReview = async (status: 'VERIFIED' | 'REJECTED') => {
    if (!reviewingPartner || !onReviewPartner) return;

    try {
      setIsReviewing(true);
      setReviewError(null);
      await onReviewPartner(reviewingPartner.id, {
        verificationStatus: status,
        adminReviewNotes: reviewNotes.trim() ? reviewNotes.trim() : null,
      });
      setReviewingPartner(null);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review decision.');
    } finally {
      setIsReviewing(false);
    }
  };

  const formatPartnerType = (type: PartnerType) => {
    switch (type) {
      case 'CAMPUS_LIBRARY':
        return '🏛️ Campus Library';
      case 'COMMUNITY_LIBRARY':
        return '📚 Community Library';
      case 'STUDENT_UNION':
        return '🎓 Student Union';
      case 'NGO':
        return '🌱 NGO Partner';
      default:
        return type;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6" data-testid="partner-directory-view">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-6 mb-8 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">🤝</span>
              <h2 className="text-2xl font-bold tracking-tight">Verified Partner Directory</h2>
            </div>
            <p className="text-emerald-100 text-sm max-w-2xl leading-relaxed">
              Official campus libraries, academic book banks, and accredited non-profit partners collaborating with
              CampusShelf for textbook redistribution, bulk donations, and community reading campaigns.
            </p>
          </div>

          {isAdmin && (
            <div className="flex items-center space-x-2 bg-emerald-950/60 p-1.5 rounded-xl border border-emerald-600/50">
              <button
                onClick={() => setActiveTab('directory')}
                data-testid="tab-public-partners"
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'directory'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                Directory
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                data-testid="tab-admin-partners"
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                🛡️ Admin Management
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Directory Tab View */}
      {activeTab === 'directory' && (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                data-testid="partner-search-input"
                placeholder="Search partner organization, library, or campus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-xl px-4 py-2.5 pl-9 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
              />
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
            </div>

            {/* Type Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'ALL', label: 'All Partners' },
                { key: 'CAMPUS_LIBRARY', label: '🏛️ Campus Libraries' },
                { key: 'NGO', label: '🌱 NGOs' },
                { key: 'COMMUNITY_LIBRARY', label: '📚 Community Libraries' },
                { key: 'STUDENT_UNION', label: '🎓 Student Unions' },
              ].map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setSelectedType(btn.key)}
                  data-testid={`filter-type-${btn.key}`}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border ${
                    selectedType === btn.key
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Partner Cards Grid */}
          {filteredPublicPartners.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
              <span className="text-4xl block mb-2">🏛️</span>
              <p className="font-semibold text-slate-700 text-sm">No verified partners found</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing your search query or selecting another filter category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5" data-testid="verified-partner-grid">
              {filteredPublicPartners.map((partner) => (
                <div
                  key={partner.id}
                  data-testid={`partner-card-${partner.id}`}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 mb-1.5 inline-block">
                          {formatPartnerType(partner.type)}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base leading-snug">{partner.name}</h3>
                      </div>

                      {/* Verified Badge (Rendered ONLY if VERIFIED) */}
                      {partner.verificationStatus === 'VERIFIED' && (
                        <div
                          data-testid="verified-partner-badge"
                          className="shrink-0 bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center space-x-1 shadow-sm"
                        >
                          <span>🛡️ Verified Partner</span>
                        </div>
                      )}
                    </div>

                    {partner.campusName && (
                      <p className="text-xs font-medium text-emerald-700 mb-2">
                        📍 Affiliated with {partner.campusName}
                      </p>
                    )}

                    <p className="text-slate-600 text-xs leading-relaxed mb-4 line-clamp-3">
                      {partner.description}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-3 mt-2 text-xs text-slate-500 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400">✉️</span>
                        <a href={`mailto:${partner.contactEmail}`} className="text-emerald-700 hover:underline">
                          {partner.contactEmail}
                        </a>
                      </div>

                      <button
                        onClick={() => setSelectedPartnerForDetail(partner)}
                        data-testid={`view-partner-profile-${partner.id}`}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center space-x-1"
                      >
                        <span>View Profile</span>
                        <span>→</span>
                      </button>
                    </div>

                    {partner.website && (
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400">🌐</span>
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 hover:underline truncate"
                        >
                          {partner.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Admin Partner Management Tab */}
      {isAdmin && activeTab === 'admin' && (
        <div data-testid="admin-partner-panel" className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Partner Review & Onboarding Queue</h3>
              <p className="text-xs text-slate-500">
                Review pending partners, verify documentation, and onboard new institutional partners.
              </p>
            </div>
            <button
              onClick={handleOpenOnboard}
              data-testid="open-onboard-partner-btn"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow transition-colors flex items-center space-x-1"
            >
              <span>+</span>
              <span>Onboard Partner</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Partner Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Campus</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(allAdminPartners.length > 0 ? allAdminPartners : partners).map((partner) => (
                  <tr key={partner.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">{partner.name}</td>
                    <td className="px-4 py-3 text-slate-600">{formatPartnerType(partner.type)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          partner.verificationStatus === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : partner.verificationStatus === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {partner.verificationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{partner.campusName || 'General (District)'}</td>
                    <td className="px-4 py-3 text-slate-600">{partner.contactEmail}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenReview(partner)}
                        data-testid={`review-partner-${partner.id}`}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded-lg border border-slate-300 text-[11px] transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Public Partner Profile Modal */}
      {selectedPartnerForDetail && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            data-testid="partner-detail-modal"
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 text-slate-800"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 mb-1.5 inline-block">
                  {formatPartnerType(selectedPartnerForDetail.type)}
                </span>
                <h3 className="text-xl font-bold text-slate-900">{selectedPartnerForDetail.name}</h3>
              </div>
              <button
                onClick={() => setSelectedPartnerForDetail(null)}
                data-testid="close-partner-detail-btn"
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {selectedPartnerForDetail.verificationStatus === 'VERIFIED' && (
              <div
                data-testid="detail-verified-badge"
                className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold mb-4 shadow-sm"
              >
                <span>🛡️ Verified Partner</span>
              </div>
            )}

            {selectedPartnerForDetail.campusName && (
              <p className="text-xs font-semibold text-emerald-700 mb-3">
                📍 Affiliated Campus: {selectedPartnerForDetail.campusName}
              </p>
            )}

            <div className="mb-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">About Organization</h4>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                {selectedPartnerForDetail.description}
              </p>
            </div>

            {/* Display Administrator Review Notes */}
            {selectedPartnerForDetail.adminReviewNotes && (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 text-xs mb-4">
                <span className="font-bold text-emerald-800 block mb-0.5">🛡️ Administrator Review & Accreditation:</span>
                <p className="text-emerald-900 italic">"{selectedPartnerForDetail.adminReviewNotes}"</p>
              </div>
            )}

            {/* Contact details */}
            <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 space-y-1.5 border border-slate-200 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">✉️ Email:</span>
                <a href={`mailto:${selectedPartnerForDetail.contactEmail}`} className="text-emerald-700 font-medium hover:underline">
                  {selectedPartnerForDetail.contactEmail}
                </a>
              </div>
              {selectedPartnerForDetail.contactPhone && (
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">📞 Phone:</span>
                  <span>{selectedPartnerForDetail.contactPhone}</span>
                </div>
              )}
              {selectedPartnerForDetail.website && (
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">🌐 Website:</span>
                  <a
                    href={selectedPartnerForDetail.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 font-medium hover:underline"
                  >
                    {selectedPartnerForDetail.website}
                  </a>
                </div>
              )}
              {selectedPartnerForDetail.address && (
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">📍 Landmark:</span>
                  <span>{selectedPartnerForDetail.address}</span>
                </div>
              )}
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-900 mb-4">
              💡 <strong>Bulk Donation / Drive Participation:</strong> Reach out directly using the verified contact details
              above to coordinate textbook drives or bulk semester donations.
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedPartnerForDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard Partner Modal */}
      {isOnboardModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-800">Onboard Partner Organization</h3>
              <button
                onClick={() => setIsOnboardModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitOnboard} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Organization Name *</label>
                <input
                  type="text"
                  data-testid="onboard-partner-name"
                  value={onboardForm.name}
                  onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                  placeholder="e.g. Darrang College Central Library"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Partner Type *</label>
                <select
                  data-testid="onboard-partner-type"
                  value={onboardForm.type}
                  onChange={(e) => setOnboardForm({ ...onboardForm, type: e.target.value as PartnerType })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="CAMPUS_LIBRARY">Campus Library</option>
                  <option value="COMMUNITY_LIBRARY">Community Library</option>
                  <option value="STUDENT_UNION">Student Union</option>
                  <option value="NGO">NGO Partner</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  data-testid="onboard-partner-desc"
                  rows={3}
                  value={onboardForm.description}
                  onChange={(e) => setOnboardForm({ ...onboardForm, description: e.target.value })}
                  placeholder="Brief overview of library holdings, community book distribution, or student lending initiatives..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    data-testid="onboard-partner-email"
                    value={onboardForm.contactEmail}
                    onChange={(e) => setOnboardForm({ ...onboardForm, contactEmail: e.target.value })}
                    placeholder="contact@org.org"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    data-testid="onboard-partner-phone"
                    value={onboardForm.contactPhone || ''}
                    onChange={(e) => setOnboardForm({ ...onboardForm, contactPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Website</label>
                <input
                  type="url"
                  data-testid="onboard-partner-website"
                  value={onboardForm.website || ''}
                  onChange={(e) => setOnboardForm({ ...onboardForm, website: e.target.value })}
                  placeholder="https://example.org"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physical Address / Campus Landmark</label>
                <input
                  type="text"
                  data-testid="onboard-partner-address"
                  value={onboardForm.address || ''}
                  onChange={(e) => setOnboardForm({ ...onboardForm, address: e.target.value })}
                  placeholder="e.g. Mahabhairab, Tezpur, Assam"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {onboardError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2 rounded-lg text-xs">
                  {onboardError}
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsOnboardModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="submit-onboard-partner-btn"
                  disabled={isOnboarding}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {isOnboarding ? 'Onboarding...' : 'Onboard Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Partner Modal */}
      {reviewingPartner && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-800">Review Partner Organization</h3>
              <button
                onClick={() => setReviewingPartner(null)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-3 space-y-1">
              <p className="font-bold text-slate-800">{reviewingPartner.name}</p>
              <p className="text-slate-500">{formatPartnerType(reviewingPartner.type)}</p>
              <p className="text-slate-600 text-[11px]">{reviewingPartner.description}</p>
              <p className="text-emerald-700">{reviewingPartner.contactEmail}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Administrator Review Notes
                </label>
                <textarea
                  data-testid="admin-review-notes"
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Record verification notes, contact accreditation checks, or rejection reason..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {reviewError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2 rounded-lg text-xs">
                  {reviewError}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  data-testid="reject-partner-btn"
                  disabled={isReviewing}
                  onClick={() => handlePerformReview('REJECTED')}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold transition-colors disabled:opacity-50"
                >
                  Reject
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setReviewingPartner(null)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    data-testid="approve-partner-btn"
                    disabled={isReviewing}
                    onClick={() => handlePerformReview('VERIFIED')}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors disabled:opacity-50"
                  >
                    {isReviewing ? 'Saving...' : '🛡️ Verify & Approve'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
