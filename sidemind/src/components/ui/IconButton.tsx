import React, { type ButtonHTMLAttributes } from 'react';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  children: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({
  title,
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      className={`icon-btn ${className}`.trim()}
      title={title}
      aria-label={title}
      {...props}
    >
      {children}
    </button>
  );
};
