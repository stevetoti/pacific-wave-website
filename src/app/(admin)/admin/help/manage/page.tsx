'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Search,
  Filter,
  Save,
  X,
  ArrowLeft,
  FileText
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  tags: string[];
  related_feature?: string;
  is_published: boolean;
  view_count: number;
  helpful_yes: number;
  helpful_no: number;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: 'getting-started', label: 'Getting Started' },
  { value: 'seo-hub', label: 'SEO Hub' },
  { value: 'geo', label: 'GEO (AI Optimization)' },
  { value: 'blog-management', label: 'Blog Management' },
  { value: 'account-settings', label: 'Account & Settings' },
];

export default function HelpManagePage() {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState<HelpArticle | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'getting-started',
    content: '',
    tags: '',
    related_feature: '',
    is_published: true,
  });

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = '/api/help/articles?';
      if (filterCategory) url += `category=${filterCategory}&`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setArticles(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleCreateNew = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      category: 'getting-started',
      content: '',
      tags: '',
      related_feature: '',
      is_published: true,
    });
    setShowEditor(true);
  };

  const handleEdit = (article: HelpArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      category: article.category,
      content: article.content,
      tags: article.tags?.join(', ') || '',
      related_feature: article.related_feature || '',
      is_published: article.is_published,
    });
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setMessage({ type: 'error', text: 'Title and content are required' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        content: formData.content.trim(),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        related_feature: formData.related_feature.trim() || null,
        is_published: formData.is_published,
      };

      let res;
      if (editingArticle) {
        res = await fetch(`/api/help/articles/${editingArticle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/help/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: editingArticle ? 'Article updated!' : 'Article created!' });
        setShowEditor(false);
        fetchArticles();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save article' });
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: 'Failed to save article' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (article: HelpArticle) => {
    if (!confirm(`Are you sure you want to delete "${article.title}"?`)) return;

    try {
      const res = await fetch(`/api/help/articles/${article.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Article deleted' });
        fetchArticles();
      } else {
        setMessage({ type: 'error', text: 'Failed to delete article' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ type: 'error', text: 'Failed to delete article' });
    }
  };

  const handleTogglePublish = async (article: HelpArticle) => {
    try {
      const res = await fetch(`/api/help/articles/${article.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !article.is_published }),
      });

      if (res.ok) {
        fetchArticles();
      }
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  const filteredArticles = articles.filter(article => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/admin/help" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 font-heading">Manage Help Articles</h1>
          </div>
          <p className="text-gray-500">Create and edit help documentation</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-vibrant-orange text-white rounded-lg font-medium hover:bg-soft-orange transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Article
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingArticle ? 'Edit Article' : 'Create New Article'}
              </h2>
              <button
                onClick={() => setShowEditor(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter article title"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content * (Markdown supported)
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your article content here. You can use Markdown formatting..."
                    rows={15}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue font-mono text-sm"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="seo, keywords, rankings"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
                  />
                </div>

                {/* Related Feature */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Related Feature (for tooltips)
                  </label>
                  <input
                    type="text"
                    value={formData.related_feature}
                    onChange={(e) => setFormData({ ...formData, related_feature: e.target.value })}
                    placeholder="citability"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used by HelpTooltip component to link to this article
                  </p>
                </div>

                {/* Published Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-4 h-4 text-deep-blue border-gray-300 rounded focus:ring-deep-blue"
                  />
                  <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                    Published (visible to users)
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowEditor(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2 bg-deep-blue text-white rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingArticle ? 'Update Article' : 'Create Article'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-deep-blue rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading articles...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No articles found</p>
            <button
              onClick={handleCreateNew}
              className="text-vibrant-orange hover:underline"
            >
              Create your first article
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {article.title}
                      </h3>
                      {!article.is_published && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          Draft
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                        {getCategoryLabel(article.category)}
                      </span>
                      <span>{article.view_count} views</span>
                      <span>👍 {article.helpful_yes} / 👎 {article.helpful_no}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePublish(article)}
                      className={`p-2 rounded-lg transition-colors ${
                        article.is_published
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={article.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {article.is_published ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(article)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(article)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/admin/help/${article.slug}`}
                      className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View"
                    >
                      <FileText className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{articles.length}</div>
          <div className="text-sm text-gray-500">Total Articles</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-600">
            {articles.filter(a => a.is_published).length}
          </div>
          <div className="text-sm text-gray-500">Published</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-yellow-600">
            {articles.filter(a => !a.is_published).length}
          </div>
          <div className="text-sm text-gray-500">Drafts</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">
            {articles.reduce((sum, a) => sum + a.view_count, 0)}
          </div>
          <div className="text-sm text-gray-500">Total Views</div>
        </div>
      </div>
    </div>
  );
}
