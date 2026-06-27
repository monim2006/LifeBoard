import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

const styles = {
  primary:
    'bg-[var(--foreground)] text-[var(--background)] hover:opacity-80',
  secondary:
    'border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--accent)]',
  ghost: 'bg-transparent text-[var(--foreground)] hover:bg-[var(--accent)]',
};

export const Button = ({ children, variant = 'primary', className, ...props }: ButtonProps) => {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition',
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
