'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase, BlogPost } from '@/lib/supabase';

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch posts from Supabase
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('site_id', 'pwd')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.category && post.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const togglePublish = async (id: string) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    const newPublished = !post.published;
    const { error } = await supabase
      .from('blog_posts')
      .update({ 
        published: newPublished,
        published_at: newPublished ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post status');
    } else {
      setPosts(posts.map(p =>
        p.id === id ? { ...p, published: newPublished } : p
      ));
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    } else {
      setPosts(posts.filter(post => post.id !== id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-deep-blue"></div>
      </div>
    );
  }

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
                      {post.image_url ? (
                        <Image
                          src={post.image_url}
                          alt={post.title}
                          width={64}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">📝</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate max-w-md">{post.title}</p>
                      <p className="text-gray-400 text-sm truncate max-w-md">{post.excerpt}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-pale-orange text-vibrant-orange text-xs font-semibold px-2 py-1 rounded-full">
                    {post.category || 'Uncategorized'}
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
                  {formatDate(post.created_at)}
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
