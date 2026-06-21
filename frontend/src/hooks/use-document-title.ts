'use client';

import { useEffect } from 'react';

/**
 * Sets the browser tab title for client-rendered routes (which can't export Next
 * metadata). Restores the previous title on unmount.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
