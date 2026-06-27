import { type ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export const Card = ({ title, children, className }: CardProps) => {
  return (
    <div
      className={clsx(
        'rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm',
        className
      )}
    >
      {title && (
        <h2 className="mb-4 text-lg font-semibold text-[var(--card-foreground)]">{title}</h2>
      )}
      {children}
    </div>
  );
};
