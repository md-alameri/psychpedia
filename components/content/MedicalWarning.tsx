'use client';

import { ReactNode } from 'react';

interface MedicalWarningProps {
  type?: 'warning' | 'danger' | 'info' | 'black-box';
  children: ReactNode;
  title?: string;
}

/**
 * Medical warning component for black box warnings, contraindications, etc.
 */
export default function MedicalWarning({ type = 'warning', children, title }: MedicalWarningProps) {
  const baseClasses = 'border-l-4 rtl:border-l-0 rtl:border-r-4 pl-6 pr-6 rtl:pl-6 rtl:pr-6 py-4 my-6 rounded-r-lg rtl:rounded-l-lg rtl:rounded-r-none';
  
  const typeClasses = {
    warning: 'border-yellow-500 bg-yellow-50',
    danger: 'border-red-500 bg-red-50',
    info: 'border-blue-500 bg-blue-50',
    'black-box': 'border-black bg-gray-100 border-2',
  };
  
  const defaultTitles = {
    warning: 'Warning',
    danger: 'Important Safety Information',
    info: 'Note',
    'black-box': 'Black Box Warning',
  };
  
  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      {title && (
        <h4 className="font-semibold text-text-primary mb-2">
          {title}
        </h4>
      )}
      {!title && type === 'black-box' && (
        <h4 className="font-bold text-text-primary mb-2 text-lg">
          {defaultTitles[type]}
        </h4>
      )}
      <div className="text-text-secondary">
        {children}
      </div>
    </div>
  );
}

