import React from 'react';
import * as Icons from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'red';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
}) => {
  if (!isOpen) return null;

  const confirmButtonClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600',
    red: 'bg-red-600 hover:bg-red-700',
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-card-light dark:bg-card-dark rounded-lg shadow-xl w-full max-w-md p-6 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start">
          <div className={`mr-4 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${confirmColor === 'red' ? 'bg-red-100' : 'bg-primary-100'}`}>
            <Icons.InformationCircleIcon className={`h-6 w-6 ${confirmColor === 'red' ? 'text-red-600' : 'text-primary-600'}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-text-light-primary dark:text-text-dark-primary">{title}</h3>
            <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mt-2">{description}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md bg-background-light dark:bg-background-dark hover:bg-border-light dark:hover:bg-border-dark text-text-light-primary dark:text-text-dark-primary"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-md text-white ${confirmButtonClasses[confirmColor]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;