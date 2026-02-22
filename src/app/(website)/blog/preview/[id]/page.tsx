'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  category: string | null;
  keywords: string[] | null;
  published: boolean;
  read_time: string | null;
  created_at: string;
}

export default function BlogPreviewPage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!params.id) return;
      
      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', params.id)
        .single();
      
      if (fetchError) {
        setError('Post not found');
      } else {
        setPost(data);
      }
      setLoading(false);
    };
    
    fetchPost();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-500">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Post Not Found</h1>
          <p className="text-gray-500 mb-8">{error || 'The post you are looking for does not exist.'}</p>
          <Link href="/admin/blog" className="text-vibrant-orange hover:underline">
            ← Back to Blog Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Preview Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white py-2 px-4 text-center text-sm font-medium">
        ⚠️ PREVIEW MODE - This post is {post.published ? 'published' : 'not published yet'}
        <Link href={`/admin/blog/edit/${post.id}`} className="ml-4 underline hover:no-underline">
          ← Back to Editor
        </Link>
      </div>

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden mt-10">
        <div className="absolute inset-0">
          {post.image_url ? (
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-deep-blue to-dark-navy"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-navy via-dark-navy/80 to-dark-navy/40"></div>
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
          <div className="max-w-4xl">
            <div className="flex items-center flex-wrap gap-3 mb-6">
              {post.category && (
                <span className="bg-vibrant-orange text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                  {post.category}
                </span>
              )}
              <span className="text-blue-200 text-sm">
                {new Date(post.created_at).toLocaleDateString()}
              </span>
              {post.read_time && (
                <span className="text-blue-200 text-sm">• {post.read_time}</span>
              )}
              {!post.published && (
                <span className="bg-amber-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                  DRAFT
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-xl text-blue-100 mb-8 max-w-3xl">
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-vibrant-orange rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">PW</span>
              </div>
              <div>
                <p className="text-white font-semibold">Pacific Wave Digital</p>
                <p className="text-blue-200 text-sm">Content Team</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Keywords */}
            {post.keywords && post.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-gray-200">
                {post.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}

            {/* Article Body */}
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl md:text-4xl font-bold text-deep-blue mt-12 mb-6">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl md:text-3xl font-bold text-deep-blue mt-12 mb-6">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl md:text-2xl font-bold text-deep-blue mt-8 mb-4">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-lg font-bold text-deep-blue mt-6 mb-3">
                      {children}
                    </h4>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-gray-700 mb-6 space-y-2">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-700">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-deep-blue">{children}</strong>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-vibrant-orange pl-6 italic text-gray-600 my-6">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-vibrant-orange hover:underline"
                      target={href?.startsWith('http') ? '_blank' : undefined}
                      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {children}
                    </a>
                  ),
                  hr: () => (
                    <hr className="my-8 border-gray-200" />
                  ),
                }}
              >
                {post.content || 'No content yet.'}
              </ReactMarkdown>
            </div>

            {/* CTA Section */}
            <div className="mt-12 p-8 bg-gradient-to-br from-deep-blue to-dark-navy rounded-2xl text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Transform Your Business?
              </h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Pacific Wave Digital helps businesses across Vanuatu, Fiji, and the Pacific Islands succeed in the digital age.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center bg-vibrant-orange text-white font-bold px-8 py-4 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Get Your Free Consultation
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
