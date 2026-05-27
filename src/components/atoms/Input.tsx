import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // Can extend in the future
}

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <input
      className={`bg-[#323443] text-white border-none rounded focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm ${className}`}
      {...props}
    />
  );
};
