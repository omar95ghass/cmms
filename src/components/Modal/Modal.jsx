import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../Button/Button';

function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        <div
          className={`relative bg-medical-card rounded-xl shadow-xl ${sizeClasses[size]} w-full`}
        >
          <div className="flex items-center justify-between p-6 border-b border-medical-border">
            <h2 className="text-xl font-semibold text-medical-text">{title}</h2>
            <button
              onClick={onClose}
              className="text-medical-muted hover:text-medical-text transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
