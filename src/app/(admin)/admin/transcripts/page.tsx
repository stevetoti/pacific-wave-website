'use client';

import { useState } from 'react';

interface Transcript {
  id: string;
  title: string;
  client: string;
  type: 'call' | 'meeting' | 'notes';
  date: string;
  duration: string;
  summary: string;
  content: string;
}

// Sample transcripts for demonstration
const sampleTranscripts: Transcript[] = [
  {
    id: '1',
    title: 'VanuConnect Product Demo',
    client: 'Air Vanuatu',
    type: 'meeting',
    date: 'Feb 20, 2026',
    duration: '45 min',
    summary: 'Demonstrated VanuConnect communication platform features to Air Vanuatu IT team.',
    content: `Meeting Notes:
    
Attendees: John (Air Vanuatu IT), Sarah (Marketing), Stephen (Pacific Wave Digital)

Key Points Discussed:
- Showed multi-channel communication features (WhatsApp, SMS, Email)
- Demonstrated AI chatbot capabilities
- Discussed integration with existing booking systems
- Pricing tier options reviewed

Action Items:
- Send detailed proposal by Friday
- Schedule follow-up call with CTO
- Prepare API documentation

Next Steps:
- Client to review proposal
- Technical integration discussion in 2 weeks`,
  },
  {
    id: '2',
    title: 'Website Project Kickoff',
    client: 'Trade & Farm Supplies',
    type: 'call',
    date: 'Feb 18, 2026',
    duration: '30 min',
    summary: 'Initial discovery call for new e-commerce website development.',
    content: `Call Summary:

Client Requirements:
- E-commerce website for agricultural supplies
- Product catalog with 500+ items
- Online payment integration
- Delivery tracking feature
- Mobile-responsive design

Timeline:
- Phase 1: Design mockups (2 weeks)
- Phase 2: Development (6 weeks)
- Phase 3: Testing & Launch (2 weeks)

Budget Discussion:
- Approved budget range: $8,000 - $12,000
- Payment terms: 50% upfront, 50% on completion`,
  },
  {
    id: '3',
    title: 'MEDD-SIM Feature Planning',
    client: 'Internal',
    type: 'notes',
    date: 'Feb 15, 2026',
    duration: '—',
    summary: 'Internal planning session for MEDD-SIM white-label features.',
    content: `Planning Notes:

White-Label Requirements:
1. Custom branding per tenant
2. Separate user databases
3. Individual billing
4. Custom domains

Technical Approach:
- Tenant identification via subdomain
- Row-level security in Supabase
- Dynamic theme system
- Stripe Connect for billing

Priority Features:
1. Tenant management dashboard ✅
2. User isolation ✅
3. Custom branding ✅
4. Billing integration (pending)`,
  },
];

export default function TranscriptsPage() {
  const [transcripts, setTranscripts] = useState<Transcript[]>(sampleTranscripts);
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTranscript, setNewTranscript] = useState({
    title: '',
    client: '',
    type: 'notes' as 'call' | 'meeting' | 'notes',
    summary: '',
    content: '',
  });

  const filteredTranscripts = transcripts.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddTranscript = () => {
    if (!newTranscript.title || !newTranscript.content) {
      alert('Please fill in title and content');
      return;
    }

    const transcript: Transcript = {
      id: Date.now().toString(),
      ...newTranscript,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      duration: newTranscript.type === 'notes' ? '—' : '0 min',
    };

    setTranscripts([transcript, ...transcripts]);
    setNewTranscript({ title: '', client: '', type: 'notes', summary: '', content: '' });
    setIsAddingNew(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this transcript?')) return;
    setTranscripts(transcripts.filter(t => t.id !== id));
    if (selectedTranscript?.id === id) {
      setSelectedTranscript(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return '📞';
      case 'meeting': return '👥';
      case 'notes': return '📝';
      default: return '📄';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-green-100 text-green-700';
      case 'meeting': return 'bg-blue-100 text-blue-700';
      case 'notes': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transcripts</h1>
          <p className="text-gray-600 mt-1">Manage call transcripts and meeting notes</p>
        </div>
        <button
          onClick={() => setIsAddingNew(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-vibrant-orange text-white font-bold rounded-lg hover:bg-soft-orange transition-colors"
        >
          <span>➕</span>
          Add Transcript
        </button>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search transcripts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
        >
          <option value="all">All Types</option>
          <option value="call">📞 Calls</option>
          <option value="meeting">👥 Meetings</option>
          <option value="notes">📝 Notes</option>
        </select>
      </div>

      {/* Add New Form */}
      {isAddingNew && (
        <div className="mb-6 bg-white rounded-xl shadow-sm p-6 border-2 border-vibrant-orange">
          <h3 className="font-bold text-lg mb-4">Add New Transcript</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Title"
              value={newTranscript.title}
              onChange={(e) => setNewTranscript({ ...newTranscript, title: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg"
            />
            <input
              type="text"
              placeholder="Client name"
              value={newTranscript.client}
              onChange={(e) => setNewTranscript({ ...newTranscript, client: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div className="mb-4">
            <select
              value={newTranscript.type}
              onChange={(e) => setNewTranscript({ ...newTranscript, type: e.target.value as 'call' | 'meeting' | 'notes' })}
              className="px-4 py-2 border border-gray-200 rounded-lg"
            >
              <option value="notes">📝 Notes</option>
              <option value="call">📞 Call</option>
              <option value="meeting">👥 Meeting</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Brief summary..."
            value={newTranscript.summary}
            onChange={(e) => setNewTranscript({ ...newTranscript, summary: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-4"
          />
          <textarea
            placeholder="Full transcript or notes..."
            value={newTranscript.content}
            onChange={(e) => setNewTranscript({ ...newTranscript, content: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-4"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddTranscript}
              className="px-4 py-2 bg-vibrant-orange text-white rounded-lg hover:bg-soft-orange"
            >
              Save Transcript
            </button>
            <button
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transcript List */}
        <div className="lg:col-span-1 space-y-3">
          {filteredTranscripts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-gray-400 text-4xl mb-2">💬</div>
              <p className="text-gray-500">No transcripts found</p>
            </div>
          ) : (
            filteredTranscripts.map((transcript) => (
              <div
                key={transcript.id}
                onClick={() => setSelectedTranscript(transcript)}
                className={`bg-white rounded-xl shadow-sm p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedTranscript?.id === transcript.id ? 'ring-2 ring-vibrant-orange' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeBadgeColor(transcript.type)}`}>
                    {getTypeIcon(transcript.type)} {transcript.type}
                  </span>
                  <span className="text-xs text-gray-400">{transcript.date}</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">{transcript.title}</h4>
                <p className="text-sm text-gray-500 mb-2">{transcript.client}</p>
                <p className="text-xs text-gray-400 line-clamp-2">{transcript.summary}</p>
              </div>
            ))
          )}
        </div>

        {/* Transcript Detail */}
        <div className="lg:col-span-2">
          {selectedTranscript ? (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-sm px-3 py-1 rounded-full font-medium ${getTypeBadgeColor(selectedTranscript.type)}`}>
                      {getTypeIcon(selectedTranscript.type)} {selectedTranscript.type}
                    </span>
                    {selectedTranscript.duration !== '—' && (
                      <span className="text-sm text-gray-500">⏱️ {selectedTranscript.duration}</span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedTranscript.title}</h2>
                  <p className="text-gray-500">{selectedTranscript.client} • {selectedTranscript.date}</p>
                </div>
                <button
                  onClick={() => handleDelete(selectedTranscript.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Summary</h4>
                <p className="text-gray-600">{selectedTranscript.summary}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Full Transcript</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans">
                    {selectedTranscript.content}
                  </pre>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                  📋 Copy Text
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                  📤 Export
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-gray-300 text-6xl mb-4">📄</div>
              <h3 className="text-lg font-semibold text-gray-500">Select a transcript</h3>
              <p className="text-gray-400 mt-1">Click on a transcript from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
