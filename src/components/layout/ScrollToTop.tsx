'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Scrolls to the top of the window when the pathname changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
