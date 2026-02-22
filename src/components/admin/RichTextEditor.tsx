'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useRef, useState, useCallback } from 'react';
import { uploadFile } from '@/lib/supabase';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const MenuBar = ({ 
  editor, 
  onImageUpload 
}: { 
  editor: ReturnType<typeof useEditor>;
  onImageUpload: () => void;
}) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    
    if (url === null) return;
    
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    
    editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
  };

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 bg-gray-50 rounded-t-lg sticky top-0 z-10">
      {/* Text Formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('bold') ? 'bg-deep-blue text-white' : ''}`}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('italic') ? 'bg-deep-blue text-white' : ''}`}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('strike') ? 'bg-deep-blue text-white' : ''}`}
        title="Strikethrough"
      >
        <s>S</s>
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
      
      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors font-bold ${editor.isActive('heading', { level: 1 }) ? 'bg-deep-blue text-white' : ''}`}
        title="Heading 1"
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-deep-blue text-white' : ''}`}
        title="Heading 2"
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors font-bold ${editor.isActive('heading', { level: 3 }) ? 'bg-deep-blue text-white' : ''}`}
        title="Heading 3"
      >
        H3
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('bulletList') ? 'bg-deep-blue text-white' : ''}`}
        title="Bullet List"
      >
        • List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('orderedList') ? 'bg-deep-blue text-white' : ''}`}
        title="Numbered List"
      >
        1. List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('blockquote') ? 'bg-deep-blue text-white' : ''}`}
        title="Quote"
      >
        ❝ Quote
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

      {/* Link & Image */}
      <button
        type="button"
        onClick={setLink}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('link') ? 'bg-deep-blue text-white' : ''}`}
        title="Add Link (Ctrl+K)"
      >
        🔗 Link
      </button>
      <button
        type="button"
        onClick={onImageUpload}
        className="p-2 rounded hover:bg-gray-200 transition-colors bg-vibrant-orange/10 text-vibrant-orange hover:bg-vibrant-orange hover:text-white"
        title="Insert Image (Upload or URL)"
      >
        🖼️ Image
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

      {/* Code & Divider */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('codeBlock') ? 'bg-deep-blue text-white' : ''}`}
        title="Code Block"
      >
        {'</>'}
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-2 rounded hover:bg-gray-200 transition-colors"
        title="Horizontal Rule"
      >
        ─
      </button>

      <div className="flex-1"></div>

      {/* Undo/Redo */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-30"
        title="Undo (Ctrl+Z)"
      >
        ↩️
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-30"
        title="Redo (Ctrl+Shift+Z)"
      >
        ↪️
      </button>
    </div>
  );
};

// Image Upload Modal Component
const ImageUploadModal = ({ 
  isOpen, 
  onClose, 
  onInsert 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onInsert: (url: string, alt?: string) => void;
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to Supabase
    setIsUploading(true);
    setUploadProgress(30);

    try {
      const url = await uploadFile(file, 'site-assets', 'blog-images');
      setUploadProgress(100);
      
      if (url) {
        setImageUrl(url);
        setActiveTab('url'); // Switch to show the uploaded URL
      } else {
        alert('Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  const handleInsert = () => {
    if (imageUrl) {
      onInsert(imageUrl, altText || undefined);
      // Reset state
      setImageUrl('');
      setAltText('');
      setPreviewUrl(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold text-gray-900">Insert Image</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'upload' 
                ? 'text-vibrant-orange border-b-2 border-vibrant-orange' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('upload')}
          >
            📤 Upload Image
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'url' 
                ? 'text-vibrant-orange border-b-2 border-vibrant-orange' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('url')}
          >
            🔗 From URL
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {activeTab === 'upload' && (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isUploading ? 'border-vibrant-orange bg-vibrant-orange/5' : 'border-gray-200 hover:border-deep-blue'
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {isUploading ? (
                <div>
                  <div className="animate-spin text-4xl mb-3">⏳</div>
                  <p className="text-gray-600 mb-2">Uploading...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-vibrant-orange h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : previewUrl ? (
                <div>
                  <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg mb-3" />
                  <p className="text-green-600 font-medium">✓ Image uploaded!</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-gray-500 hover:text-deep-blue mt-2"
                  >
                    Choose different image
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-5xl mb-3">🖼️</div>
                  <p className="text-gray-600 mb-2">
                    Drag & drop an image here, or
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-vibrant-orange text-white px-6 py-2 rounded-lg font-medium hover:bg-soft-orange transition-colors"
                  >
                    Browse Files
                  </button>
                  <p className="text-xs text-gray-400 mt-3">
                    Supports: JPG, PNG, GIF, WebP (max 5MB)
                  </p>
                </>
              )}
            </div>
          )}

          {activeTab === 'url' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
              />
              {imageUrl && (
                <div className="mt-3">
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="max-h-40 mx-auto rounded-lg"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
            </div>
          )}

          {/* Alt Text (always shown) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alt Text <span className="text-gray-400 font-normal">(for SEO & accessibility)</span>
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleInsert}
            disabled={!imageUrl}
            className="px-6 py-2 bg-vibrant-orange text-white rounded-lg font-medium hover:bg-soft-orange transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Insert Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full mx-auto my-4 shadow-sm',
        },
        allowBase64: true,
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-vibrant-orange underline hover:text-deep-blue',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your blog post... Use the toolbar above to format text, add images, links, and more.',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none p-4 min-h-[400px] focus:outline-none',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            handleImageDrop(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of Array.from(items)) {
            if (item.type.startsWith('image/')) {
              const file = item.getAsFile();
              if (file) {
                event.preventDefault();
                handleImageDrop(file);
                return true;
              }
            }
          }
        }
        return false;
      },
    },
  });

  const handleImageDrop = useCallback(async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    // Show uploading indicator
    const placeholder = `![Uploading ${file.name}...]()`;
    
    try {
      const url = await uploadFile(file, 'site-assets', 'blog-images');
      if (url && editor) {
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      }
    } catch (error) {
      console.error('Drop upload error:', error);
      alert('Failed to upload image');
    }
  }, [editor]);

  const handleInsertImage = (url: string, alt?: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url, alt: alt || '' }).run();
    }
  };

  return (
    <div 
      className={`border border-gray-200 rounded-lg overflow-hidden transition-colors ${
        isDragging ? 'border-vibrant-orange border-2 bg-vibrant-orange/5' : ''
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={() => setIsDragging(false)}
    >
      <MenuBar editor={editor} onImageUpload={() => setShowImageModal(true)} />
      
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-vibrant-orange/10 pointer-events-none z-10">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-4xl mb-2">📷</div>
            <p className="font-medium text-gray-700">Drop image to upload</p>
          </div>
        </div>
      )}
      
      <div className="relative">
        <EditorContent editor={editor} />
      </div>

      <ImageUploadModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onInsert={handleInsertImage}
      />

      {/* Helper text */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
        💡 Tip: You can drag & drop images directly into the editor, or paste from clipboard
      </div>
    </div>
  );
}
