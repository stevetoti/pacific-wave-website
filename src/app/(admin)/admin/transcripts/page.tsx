'use client';

export default function TranscriptsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transcripts</h1>
        <p className="text-gray-600 mt-1">Manage call transcripts and meeting notes</p>
      </div>

      {/* Coming Soon */}
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <div className="text-gray-400 text-6xl mb-4">💬</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Coming Soon</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          The transcripts feature is under development. Soon you&apos;ll be able to view, search, and manage 
          transcripts from client calls and meetings.
        </p>
      </div>
    </div>
  );
}
