'use client';

import React, { useState, useEffect } from 'react';
import { getIconSvgAction } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';

interface IconRendererProps {
  url: string;
}

export function IconRenderer({ url }: IconRendererProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setIsLoading(false);
      return
    };

    setIsLoading(true);
    setError(null);
    setSvgContent(null);

    const fetchIcon = async () => {
      try {
        const text = await getIconSvgAction(url);
        setSvgContent(text);
      } catch (e: any) {
        console.error("Error fetching icon:", e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIcon();
  }, [url]);

  if (isLoading) {
    return <Skeleton className="w-full h-full" />;
  }

  if (error || !svgContent) {
    // A simple visual indicator for an error
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-100 text-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      </div>
    );
  }

  const dataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`;

  return (
    <img
      src={dataUrl}
      alt="Selected icon"
      className="w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
}
