import React from 'react';

function Button({ children, variant = 'primary', className = '', icon, iconPosition = 'left', ...props }) {
  const baseClasses = 'crystal-button inline-flex items-center gap-2';
  const variantClasses = {
    primary: 'crystal-button-primary',
    secondary: 'crystal-button-secondary',
    danger: 'crystal-button bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const iconElement = icon ? (
    <i className={`fas ${icon} ${iconPosition === 'right' ? 'order-2' : ''}`}></i>
  ) : null;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {iconPosition === 'left' && iconElement}
      {children}
      {iconPosition === 'right' && iconElement}
    </button>
  );
}

export default Button;
