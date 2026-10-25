import type { ReactNode } from 'react';

/** إطار جوال بعتاد CSS — بلا صور */
export function PhoneFrame({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`phone-frame ${className}`}>
      <div className="phone-island" />
      <div className="phone-screen">{children}</div>
    </div>
  );
}
