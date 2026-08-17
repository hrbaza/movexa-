import { useEffect } from 'react';

/** Sets the browser tab title, restoring the default on unmount. */
export default function useDocumentTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} — Movexa` : 'Movexa — Watch Movies & Shows';
    return () => {
      document.title = prev;
    };
  }, [title]);
}
