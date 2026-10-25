'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopyPhoneButton({ phone, className = 'btn btn-soft' }: { phone?: string | null; className?: string }) {
  const [copied, setCopied] = useState(false);

  if (!phone) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // المتصفح منع الوصول للحافظة
    }
  };

  return (
    <button type="button" onClick={copy} className={className}>
      {copied ? (
        <Check key="check" className="h-4 w-4 icon-spin" />
      ) : (
        <Copy key="copy" className="h-4 w-4" />
      )}
      {copied ? 'تم النسخ' : 'نسخ الرقم'}
    </button>
  );
}
