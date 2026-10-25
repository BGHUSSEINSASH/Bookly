'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const url = window.location.href;
    const title = document.title;
    try {
      if (navigator.share) {
        await navigator.share({ url, title });
        return;
      }
    } catch {
      // المستخدم ألغى المشاركة — نتجاهل
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // المتصفح منع الوصول للحافظة
    }
  };

  return (
    <button type="button" onClick={onClick} className="btn btn-ghost !px-3" title="مشاركة">
      {copied ? (
        <Check key="check" className="h-4 w-4 icon-spin" />
      ) : (
        <Share2 key="share" className="h-4 w-4" />
      )}
    </button>
  );
}
