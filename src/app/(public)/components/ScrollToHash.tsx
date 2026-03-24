'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function scrollToHashElement() {
  const hash = window.location.hash;
  if (!hash || hash === '#') return;
  const id = decodeURIComponent(hash.slice(1));
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function ScrollToHash() {
  const pathname = usePathname();

  useEffect(() => {
    const t0 = window.setTimeout(scrollToHashElement, 0);
    const t1 = window.setTimeout(scrollToHashElement, 75);
    window.addEventListener('hashchange', scrollToHashElement);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      window.removeEventListener('hashchange', scrollToHashElement);
    };
  }, [pathname]);

  return null;
}
