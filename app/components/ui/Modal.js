import { useEffect } from 'react';
import { cn } from '../../../lib/utils';
import Button from './Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  className = '',
  size = 'md' 
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        <div
          className={cn(
            'relative bg-white rounded-lg shadow-xl w-full',
            sizes[size],
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const ModalHeader = ({ children, onClose, className = '' }) => {
  return (
    <div className={cn('flex items-center justify-between p-6 border-b', className)}>
      <div className="text-lg font-semibold text-gray-900">
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

const ModalContent = ({ children, className = '' }) => {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  );
};

const ModalFooter = ({ children, className = '' }) => {
  return (
    <div className={cn('flex justify-end space-x-3 p-6 border-t bg-gray-50', className)}>
      {children}
    </div>
  );
};

Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;

export default Modal;
