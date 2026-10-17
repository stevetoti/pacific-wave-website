"use client";

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';

type BlogImageProps = Omit<ImageProps, 'src' | 'onError'> & { src: string };

export default function BlogImage({ src, alt, ...props }: BlogImageProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const fallback = '/images/blog/web-editorial.webp';
  const source = failedSource === src ? fallback : src;
  return <Image {...props} src={source} alt={alt} onError={() => { if (source !== fallback) setFailedSource(src); }} />;
}
