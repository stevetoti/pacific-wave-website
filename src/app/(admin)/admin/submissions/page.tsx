'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Submission {
  id: string;
  created_at: string;
  project_type: string;
  project_description: string | null;
  website_details: Record<string, unknown>;
  ai_automation: Record<string, unknown>;
  social_media: Record<string, unknown>;
  budget_range: string | null;
  timeline: string | null;
  urgency: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  company_name: string | null;
  preferred_contact: string | null;
  best_time_to_call: string | null;
  additional_notes: string | null;
  ai_summary: string | null;
  status: string;
  assigned_to: string | null;
  notes: string | null;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-purple-100 text-purple-700',
  proposal_sent: 'bg-orange-100 text-orange-700',
  converted: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  new: '🆕 New',
  contacted: '📞 Contacted',
  qualified: '✅ Qualified',
  proposal_sent: '📄 Proposal Sent',
  converted: '🎉 Converted',
  lost: '❌ Lost',
};

const projectTypeIcons: Record<string, string> = {
  website: '🌐',
  webapp: '💻',
  mobile: '📱',
  ai: '🤖',
  social: '📣',
  'full-package': '🚀',
};

const budgetLabels: Record<string, string> = {
  '1000-3000': '$1K-$3K',
  '3000-5000': '$3K-$5K',
  '5000-10000': '$5K-$10K',
  '10000-20000': '$10K-$20K',
  '20000+': '$20K+',
  'unsure': 'TBD',
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [error, setError] = useState('');

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('project_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
      setError('Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('project_submissions')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setSubmissions(subs => 
        subs.map(s => s.id === id ? { ...s, status: newStatus } : s)
      );

      if (selectedSubmission?.id === id) {
        setSelectedSubmission({ ...selectedSubmission, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status');
    }
  };

  const filteredSubmissions = submissions.filter(s => 
    filterStatus === 'all' || s.status === filterStatus
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-deep-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Submissions</h1>
          <p className="text-gray-600 mt-1">Leads from the Get Started form</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{submissions.length} total</span>
          <button
            onClick={fetchSubmissions}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'New Leads', status: 'new', color: 'bg-blue-500' },
          { label: 'Contacted', status: 'contacted', color: 'bg-yellow-500' },
          { label: 'Qualified', status: 'qualified', color: 'bg-purple-500' },
          { label: 'Converted', status: 'converted', color: 'bg-green-500' },
        ].map((stat) => (
          <div key={stat.status} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`w-3 h-3 rounded-full ${stat.color} mb-2`}></div>
            <p className="text-2xl font-bold text-gray-900">
              {submissions.filter(s => s.status === stat.status).length}
            </p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {['all', 'new', 'contacted', 'qualified', 'proposal_sent', 'converted', 'lost'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === status
                ? 'bg-deep-blue text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : statusLabels[status] || status}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto">
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-gray-500">No submissions yet</p>
            </div>
          ) : (
            filteredSubmissions.map((sub) => (
              <div
                key={sub.id}
                onClick={() => setSelectedSubmission(sub)}
                className={`bg-white rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                  selectedSubmission?.id === sub.id ? 'ring-2 ring-vibrant-orange' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[sub.status] || 'bg-gray-100 text-gray-700'}`}>
                    {statusLabels[sub.status] || sub.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(sub.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{projectTypeIcons[sub.project_type] || '📋'}</span>
                  <h4 className="font-semibold text-gray-900">{sub.contact_name}</h4>
                </div>
                <p className="text-sm text-gray-500">{sub.company_name || sub.contact_email}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span>{sub.project_type}</span>
                  {sub.budget_range && (
                    <>
                      <span>•</span>
                      <span>{budgetLabels[sub.budget_range] || sub.budget_range}</span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selectedSubmission ? (
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{projectTypeIcons[selectedSubmission.project_type] || '📋'}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedSubmission.contact_name}</h2>
                      <p className="text-gray-500">{selectedSubmission.company_name || 'Individual'}</p>
                    </div>
                  </div>
                </div>
                <select
                  value={selectedSubmission.status}
                  onChange={(e) => updateStatus(selectedSubmission.id, e.target.value)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${statusColors[selectedSubmission.status] || 'bg-gray-100'}`}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">📞 Contact Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Email</p>
                    <a href={`mailto:${selectedSubmission.contact_email}`} className="text-deep-blue hover:underline">
                      {selectedSubmission.contact_email}
                    </a>
                  </div>
                  {selectedSubmission.contact_phone && (
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <a href={`tel:${selectedSubmission.contact_phone}`} className="text-deep-blue hover:underline">
                        {selectedSubmission.contact_phone}
                      </a>
                    </div>
                  )}
                  {selectedSubmission.preferred_contact && (
                    <div>
                      <p className="text-gray-500">Preferred Contact</p>
                      <p className="text-gray-900">{selectedSubmission.preferred_contact}</p>
                    </div>
                  )}
                  {selectedSubmission.best_time_to_call && (
                    <div>
                      <p className="text-gray-500">Best Time</p>
                      <p className="text-gray-900">{selectedSubmission.best_time_to_call}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Details */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">📋 Project Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Project Type</p>
                    <p className="text-gray-900 capitalize">{selectedSubmission.project_type.replace('-', ' ')}</p>
                  </div>
                  {selectedSubmission.budget_range && (
                    <div>
                      <p className="text-gray-500">Budget</p>
                      <p className="text-gray-900">{budgetLabels[selectedSubmission.budget_range] || selectedSubmission.budget_range}</p>
                    </div>
                  )}
                  {selectedSubmission.timeline && (
                    <div>
                      <p className="text-gray-500">Timeline</p>
                      <p className="text-gray-900">{selectedSubmission.timeline}</p>
                    </div>
                  )}
                  {selectedSubmission.urgency && (
                    <div>
                      <p className="text-gray-500">Urgency</p>
                      <p className="text-gray-900">{selectedSubmission.urgency}</p>
                    </div>
                  )}
                </div>
                {selectedSubmission.project_description && (
                  <div className="mt-4">
                    <p className="text-gray-500 text-sm">Description</p>
                    <p className="text-gray-900">{selectedSubmission.project_description}</p>
                  </div>
                )}
              </div>

              {/* Requirements */}
              {(selectedSubmission.website_details && Object.keys(selectedSubmission.website_details).length > 0) && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-gray-700 mb-3">🌐 Website Requirements</h3>
                  <div className="text-sm space-y-1">
                    {Object.entries(selectedSubmission.website_details).map(([key, value]) => {
                      if (!value) return null;
                      return (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-gray-900">{String(value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AI Summary */}
              {selectedSubmission.ai_summary && (
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-blue-700 mb-3">🤖 AI Summary</h3>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {selectedSubmission.ai_summary}
                  </pre>
                </div>
              )}

              {/* Additional Notes */}
              {selectedSubmission.additional_notes && (
                <div className="bg-yellow-50 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-yellow-700 mb-3">📝 Additional Notes</h3>
                  <p className="text-gray-700">{selectedSubmission.additional_notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <a
                  href={`mailto:${selectedSubmission.contact_email}?subject=Re: Your Project Inquiry at Pacific Wave Digital`}
                  className="px-4 py-2 bg-vibrant-orange text-white rounded-lg hover:bg-soft-orange transition-colors"
                >
                  ✉️ Send Email
                </a>
                {selectedSubmission.contact_phone && (
                  <a
                    href={`https://wa.me/${selectedSubmission.contact_phone.replace(/\D/g, '')}`}
                    target="_blank"
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    💬 WhatsApp
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl text-gray-300 mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-500">Select a submission</h3>
              <p className="text-gray-400 mt-1">Click on a lead to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
