'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Static blog posts for now - will be replaced with Supabase
const initialPosts = [
  {
    id: '1',
    title: 'AI Business Automation for Pacific Island Enterprises: A Complete Guide for 2025',
    slug: 'ai-business-automation-pacific-islands-2025',
    excerpt: 'Discover how AI-powered automation is transforming businesses across Vanuatu, Fiji, and the Pacific Islands.',
    category: 'AI Solutions',
    image: '/images/services/ai-solutions.jpg',
    published: true,
    date: 'February 15, 2026',
  },
  {
    id: '2',
    title: 'Why Every Vanuatu Business Needs a Professional Website in 2025',
    slug: 'web-development-vanuatu-business-growth',
    excerpt: 'In today\'s digital economy, a professional website is essential for business growth in Vanuatu.',
    category: 'Web Development',
    image: '/images/services/web-dev.jpg',
    published: true,
    date: 'February 10, 2026',
  },
  {
    id: '3',
    title: 'Mobile App Development for Pacific Island Businesses',
    slug: 'mobile-app-development-pacific-islands',
    excerpt: 'Building mobile apps for the Pacific requires unique considerations.',
    category: 'Mobile Development',
    image: '/images/services/mobile-apps.jpg',
    published: true,
    date: 'February 5, 2026',
  },
  {
    id: '4',
    title: 'Digital Marketing Strategies That Work for Pacific Island SMEs',
    slug: 'digital-marketing-strategies-pacific-smes',
    excerpt: 'Discover proven digital marketing strategies specifically designed for Pacific businesses.',
    category: 'Digital Marketing',
    image: '/images/services/digital-marketing.jpg',
    published: true,
    date: 'January 28, 2026',
  },
];

export default function BlogAdminPage() {
  const [posts, setPosts] = useState(initialPosts);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePublish = (id: string) => {
    setPosts(posts.map(post =>
      post.id === id ? { ...post, published: !post.published } : post
    ));
  };

  const deletePost = (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      setPosts(posts.filter(post => post.id !== id));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-heading">Blog Posts</h1>
          <p className="text-gray-500 mt-1">Manage your blog articles</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="bg-vibrant-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-soft-orange transition-colors flex items-center gap-2"
        >
          <span>✍️</span>
          New Post
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
            />
          </div>
          <div className="text-gray-500 text-sm">
            {filteredPosts.length} posts
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Post</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Category</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map((post) => (
              <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={post.image}
                        alt={post.title}
                        width={64}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate max-w-md">{post.title}</p>
                      <p className="text-gray-400 text-sm truncate max-w-md">{post.excerpt}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-pale-orange text-vibrant-orange text-xs font-semibold px-2 py-1 rounded-full">
                    {post.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => togglePublish(post.id)}
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      post.published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {post.published ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {post.date}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="p-2 text-gray-400 hover:text-deep-blue transition-colors"
                      title="View"
                    >
                      👁️
                    </Link>
                    <Link
                      href={`/admin/blog/edit/${post.id}`}
                      className="p-2 text-gray-400 hover:text-deep-blue transition-colors"
                      title="Edit"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No posts found</p>
          </div>
        )}
      </div>
    </div>
  );
}
