import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

const styles = {
  primary: 'bg-slate-900 text-white hover:bg-slate-700',
  secondary: 'bg-white border border-slate-200 text-slate-900 hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-900 hover:bg-slate-100',
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
