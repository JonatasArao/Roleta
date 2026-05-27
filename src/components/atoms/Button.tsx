import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white",
    secondary: "bg-[#1b1c23] hover:bg-[#252733] border border-white/10 text-white",
    danger: "bg-red-600 hover:bg-red-500 text-white",
    ghost: "text-slate-400 hover:text-white bg-transparent",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded",
    md: "px-4 py-2 rounded-lg",
    lg: "px-6 py-3 rounded-lg text-lg",
    icon: "p-2 rounded-full",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

