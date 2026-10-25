'use client';

import { useEffect, useState } from 'react';

/**
 * حضور الأوفرلاي — يبقي العنصر mounted فترة خروج قصيرة
 * حتى تكتمل حركة الـexit بدل الاختفاء الفوري.
 */
export function usePresence(open: boolean, exitMs = 200) {
  const [mounted, setMounted] = useState(open);
  const [status, setStatus] = useState<'enter' | 'exit' | 'idle'>(
    open ? 'enter' : 'idle',
  );

  useEffect(() => {
    if (open) {
      setMounted(true);
      setStatus('enter');
      return;
    }
    setStatus('exit');
    const t = setTimeout(() => setMounted(false), exitMs);
    return () => clearTimeout(t);
  }, [open, exitMs]);

  const overlayClass =
    status === 'enter' ? 'overlay-enter' : status === 'exit' ? 'overlay-exit' : '';
  const panelClass =
    status === 'enter' ? 'panel-enter' : status === 'exit' ? 'panel-exit' : '';
  const dropdownClass =
    status === 'enter' ? 'dropdown-enter' : status === 'exit' ? 'overlay-exit' : '';

  return { mounted, status, overlayClass, panelClass, dropdownClass };
}
