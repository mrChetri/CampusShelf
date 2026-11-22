import React, { useState } from 'react';
import type {
  CampaignNeed,
  PartnerOrganization,
  CreateCampaignNeedInput,
  UpdateCampaignNeedInput,
  CampaignNeedCategory,
  CampaignNeedStatus,
} from '@campusshelf/contracts';

export interface CampaignNeedsViewProps {
  needs: CampaignNeed[];
  partners: PartnerOrganization[];
  isAdmin?: boolean;
  onDonateForNeed: (need: CampaignNeed) => void;
  onCreateNeed?: (input: CreateCampaignNeedInput) => Promise<CampaignNeed | void>;
  onUpdateNeed?: (id: string, input: UpdateCampaignNeedInput) => Promise<CampaignNeed | void>;
}

const CATEGORY_LABELS: Record<string, string> = {
  ACADEMIC: 'Academic & Textbooks',
  COMPETITIVE_EXAM: 'Competitive Exam Prep',
  LITERATURE_FICTION: 'Literature & Fiction',
  GENERAL_READING: 'General Reading & Non-Fiction',
  CHILDRENS_BOOKS: "Children's & Foundation",
};

const DEFAULT_NEED_FORM = {
  partnerId: '',
  title: '',
  category: 'ACADEMIC' as CampaignNeedCategory,
  course: '',
  description: '',
  targetQuantity: 10,
  urgent: false,
};

export const CampaignNeedsView: React.FC<CampaignNeedsViewProps> = ({
  needs,
  partners,
  isAdmin = false,
  onDonateForNeed,
  onCreateNeed,
  onUpdateNeed,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNeedId, setEditingNeedId] = useState<string | null>(null);
  const [formData, setFormData] = useState(DEFAULT_NEED_FORM);
  const [editingStatus, setEditingStatus] = useState<CampaignNeedStatus>('ACTIVE');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter verified partners for creation
  const verifiedPartners = partners.filter((p) => p.verificationStatus === 'VERIFIED');

  const filteredNeeds = needs.filter((need) => {
    if (selectedCategory !== 'ALL' && need.category !== selectedCategory) {
      return false;
    }
    if (selectedStatus !== 'ALL' && need.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = need.title.toLowerCase().includes(q);
      const matchPartner = need.partnerName.toLowerCase().includes(q);
      const matchCourse = need.course?.toLowerCase().includes(q) ?? false;
      const matchDesc = need.description?.toLowerCase().includes(q) ?? false;
      if (!matchTitle && !matchPartner && !matchCourse && !matchDesc) {
        return false;
      }
    }
    return true;
  });

  const handleOpenCreate = () => {
    setEditingNeedId(null);
    setFormData({
      ...DEFAULT_NEED_FORM,
      partnerId: verifiedPartners[0]?.id || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (need: CampaignNeed) => {
    setEditingNeedId(need.id);
    setFormData({
      partnerId: need.partnerId,
      title: need.title,
      category: need.category,
      course: need.course || '',
      description: need.description || '',
      targetQuantity: need.targetQuantity,
      urgent: need.urgent,
    });
    setEditingStatus(need.status);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.partnerId.trim()) {
      setFormError('Please select a verified partner organization.');
      return;
    }
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      setFormError('Campaign title must be at least 3 characters.');
      return;
    }
    const trimmedDesc = (formData.description || '').trim();
    if (!trimmedDesc || trimmedDesc.length < 5) {
      setFormError('Description must be at least 5 characters.');
      return;
    }
    if (formData.targetQuantity < 1 || formData.targetQuantity > 10000) {
      setFormError('Target quantity must be between 1 and 10,000.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingNeedId) {
        if (onUpdateNeed) {
          await onUpdateNeed(editingNeedId, {
            title: formData.title.trim(),
            category: formData.category,
            course: formData.course.trim() || null,
            description: trimmedDesc,
            targetQuantity: formData.targetQuantity,
            status: editingStatus,
            urgent: formData.urgent,
          });
        }
      } else {
        if (onCreateNeed) {
          await onCreateNeed({
            partnerId: formData.partnerId,
            title: formData.title.trim(),
            category: formData.category,
            course: formData.course.trim() || undefined,
            description: trimmedDesc,
            targetQuantity: formData.targetQuantity,
            urgent: formData.urgent,
          });
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save campaign need.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section data-testid="campaign-needs-view" className="w-full text-left space-y-6">
      {/* Header section */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <span>🌱 Community Campaigns</span>
              <span>•</span>
              <span>Direct Impact</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">NGO & Partner Book Drives</h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
              Donate directly to targeted drives run by verified NGOs, community libraries, and campus reading rooms.
              Books fulfill structured student needs with verified handover tracking.
            </p>
          </div>

          {isAdmin && (
            <button
              data-testid="open-create-need-btn"
              onClick={handleOpenCreate}
              className="bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-colors flex items-center space-x-2 self-start sm:self-auto shrink-0"
            >
              <span>+</span>
              <span>Publish Book Need</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
          {/* Category filter */}
          <select
            data-testid="filter-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
              <option key={cat} value={cat}>
                {label}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            data-testid="filter-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Drives</option>
            <option value="FULFILLED">Goal Reached 🎉</option>
            <option value="PAUSED">Paused</option>
          </select>
        </div>

        {/* Search input */}
        <div className="w-full md:w-72">
          <input
            type="text"
            data-testid="search-campaign-needs"
            placeholder="Search drives by title, partner, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredNeeds.length === 0 && (
        <div
          data-testid="campaign-needs-empty"
          className="bg-white rounded-2xl p-10 border border-slate-200 text-center max-w-md mx-auto"
        >
          <div className="text-3xl mb-2">📚</div>
          <h3 className="font-bold text-slate-800 text-sm">No campaign drives found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
              ? 'Try resetting the filters or searching for another topic.'
              : 'Verified partners have not published any active book needs yet.'}
          </p>
        </div>
      )}

      {/* Grid of Campaign Needs */}
      {filteredNeeds.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNeeds.map((need) => {
            const progressPct = Math.min(
              100,
              Math.round((need.fulfilledQuantity / (need.targetQuantity || 1)) * 100)
            );
            const isFulfilled = need.status === 'FULFILLED' || need.fulfilledQuantity >= need.targetQuantity;

            return (
              <div
                key={need.id}
                data-testid={`campaign-need-card-${need.id}`}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <span
                      data-testid="need-partner-name"
                      className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 truncate max-w-[200px]"
                    >
                      🏛️ {need.partnerName}
                    </span>

                    {need.urgent && (
                      <span
                        data-testid="need-urgent-badge"
                        className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-1"
                      >
                        <span>🚨</span>
                        <span>URGENT NEED</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Category */}
                  <h3
                    data-testid="need-title"
                    className="font-bold text-slate-900 text-base leading-snug hover:text-emerald-700 transition-colors"
                  >
                    {need.title}
                  </h3>

                  <div className="flex items-center space-x-2 mt-2 flex-wrap gap-y-1">
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
                      {CATEGORY_LABELS[need.category] || need.category}
                    </span>
                    {need.course && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded">
                        Course: {need.course}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                    {need.description}
                  </p>
                </div>

                {/* Progress bar and CTA */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span data-testid="need-progress-text" className="font-semibold text-slate-700">
                      {need.fulfilledQuantity} / {need.targetQuantity} Books Collected
                    </span>
                    <span className="font-bold text-emerald-700 text-[11px]">{progressPct}%</span>
                  </div>

                  {/* Progress bar line */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <div
                      data-testid="need-progress-bar"
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFulfilled ? 'bg-emerald-500' : 'bg-teal-600'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  {/* Status & Action */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span
                      data-testid="need-status-badge"
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isFulfilled
                          ? 'bg-emerald-100 text-emerald-800'
                          : need.status === 'PAUSED'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-teal-50 text-teal-800 border border-teal-200'
                      }`}
                    >
                      {isFulfilled ? 'Goal Reached 🎉' : need.status === 'PAUSED' ? 'Paused' : 'Active Drive'}
                    </span>

                    <div className="flex items-center space-x-2">
                      {isAdmin && (
                        <button
                          data-testid={`edit-need-btn-${need.id}`}
                          onClick={() => handleOpenEdit(need)}
                          className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          Edit
                        </button>
                      )}

                      {need.status === 'ACTIVE' && (
                        <button
                          data-testid="donate-for-campaign-btn"
                          onClick={() => onDonateForNeed(need)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center space-x-1"
                        >
                          <span>🌱</span>
                          <span>Donate Book</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Publish / Edit Modal */}
      {isModalOpen && (
        <div
          data-testid="campaign-need-modal"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 text-left relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-800">
                {editingNeedId ? 'Edit Book Campaign Need' : 'Publish Partner Book Need'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div
                data-testid="need-form-error"
                className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg mb-4"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {/* Partner selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Partner Organization *
                </label>
                <select
                  data-testid="need-partner-select"
                  value={formData.partnerId}
                  onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                  disabled={Boolean(editingNeedId)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">Select a verified partner...</option>
                  {verifiedPartners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  data-testid="need-title-input"
                  placeholder="e.g. B.Sc Semester 1 Physics Textbook Drive"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    data-testid="need-category-select"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as CampaignNeedCategory })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                      <option key={cat} value={cat}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Course */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course / Target Level</label>
                  <input
                    type="text"
                    data-testid="need-course-input"
                    placeholder="e.g. Higher Secondary, B.Sc"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  data-testid="need-description-input"
                  placeholder="Explain who will benefit from these donated books and pickup instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Target quantity */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Quantity *</label>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    data-testid="need-target-quantity-input"
                    value={formData.targetQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, targetQuantity: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Status if editing */}
                {editingNeedId && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Campaign Status *</label>
                    <select
                      data-testid="need-status-select"
                      value={editingStatus}
                      onChange={(e) => setEditingStatus(e.target.value as CampaignNeedStatus)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="FULFILLED">FULFILLED</option>
                      <option value="PAUSED">PAUSED</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Urgent checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="urgent-need-checkbox"
                  data-testid="need-urgent-checkbox"
                  checked={formData.urgent}
                  onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <label htmlFor="urgent-need-checkbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Mark as Urgent Need (Highlights with urgent badge)
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="submit-need-btn"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Saving...'
                    : editingNeedId
                    ? 'Update Need'
                    : 'Publish Campaign Need'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
