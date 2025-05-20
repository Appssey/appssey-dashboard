import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'default',
  size = 'md',
  isLoading = false,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-primary text-background hover:bg-primary/90',
    outline: 'border border-border bg-transparent hover:bg-background-light text-primary',
    ghost: 'bg-transparent hover:bg-background-light text-primary',
    link: 'bg-transparent underline-offset-4 hover:underline text-primary p-0 h-auto',
  };
  
  const sizes = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8 py-2 text-base',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg 
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg" 
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
};

export default Button;