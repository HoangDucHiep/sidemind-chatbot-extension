import React, { type ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'filled' | 'ghost' | 'accent' | 'danger';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const variantClass =
    variant === 'filled'
      ? 'btn-filled'
      : variant === 'ghost'
        ? 'btn-ghost'
        : variant === 'accent'
          ? 'btn-accent'
          : variant === 'danger'
            ? 'btn-danger'
            : '';

  const sizeClass = size === 'sm' ? 'btn-sm' : '';

  return (
    <button className={`btn ${variantClass} ${sizeClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
};
