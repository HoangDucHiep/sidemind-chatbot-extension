import React, { type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean;
}

export const Input: React.FC<InputProps> = ({ mono, className = '', ...props }) => {
  return (
    <input
      className={`input ${mono ? 'input-mono' : ''} ${className}`.trim()}
      {...props}
    />
  );
};
