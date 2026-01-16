import React from 'react';
import * as Icons from './icons';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const FormModal: React.FC<FormModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-card-light dark:bg-card-dark rounded-lg shadow-xl w-full max-w-md animate-scaleIn flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark flex-shrink-0">
          <h3 className="text-lg font-bold text-text-light-primary dark:text-text-dark-primary">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-background-light dark:hover:bg-background-dark">
            <Icons.XIcon className="w-5 h-5" />
          </button>
        </header>
        <form onSubmit={(e) => e.preventDefault()}>
            <main className="p-6 flex-1">{children}</main>
            {footer && (
            <footer className="p-4 border-t border-border-light dark:border-border-dark flex justify-end space-x-2 flex-shrink-0">
                {footer}
            </footer>
            )}
        </form>
      </div>
    </div>
  );
};

export default FormModal;