import React, { useState } from 'react';
import { EditScope } from '../pages/SchedulePage';

interface RecurringEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scope: EditScope) => void;
  action: 'save' | 'delete';
}

const RecurringEditModal: React.FC<RecurringEditModalProps> = ({ isOpen, onClose, onConfirm, action }) => {
  const [scope, setScope] = useState<EditScope>('one');
  
  if (!isOpen) return null;

  const actionText = action === 'save' ? 'change' : 'delete';
  const titleText = action === 'save' ? 'Edit Recurring Event' : 'Delete Recurring Event';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">{titleText}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Would you like to {actionText} only this event, this and future events, or the entire series?
        </p>

        <div className="space-y-4">
          <label className="flex items-center p-3 rounded-md border dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 has-[:checked]:bg-primary-50 has-[:checked]:border-primary-500 dark:has-[:checked]:bg-primary-900/20">
            <input type="radio" name="editScope" value="one" checked={scope === 'one'} onChange={() => setScope('one')} className="h-4 w-4 text-primary-600 focus:ring-primary-500" />
            <span className="ml-3 text-sm font-medium">This event only</span>
          </label>
          <label className="flex items-center p-3 rounded-md border dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 has-[:checked]:bg-primary-50 has-[:checked]:border-primary-500 dark:has-[:checked]:bg-primary-900/20">
            <input type="radio" name="editScope" value="future" checked={scope === 'future'} onChange={() => setScope('future')} className="h-4 w-4 text-primary-600 focus:ring-primary-500" />
            <span className="ml-3 text-sm font-medium">This and following events</span>
          </label>
          <label className="flex items-center p-3 rounded-md border dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 has-[:checked]:bg-primary-50 has-[:checked]:border-primary-500 dark:has-[:checked]:bg-primary-900/20">
            <input type="radio" name="editScope" value="all" checked={scope === 'all'} onChange={() => setScope('all')} className="h-4 w-4 text-primary-600 focus:ring-primary-500" />
            <span className="ml-3 text-sm font-medium">All events in the series</span>
          </label>
        </div>

        <div className="flex justify-end space-x-3 mt-8">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
          <button onClick={() => onConfirm(scope)} className="px-4 py-2 text-sm font-medium rounded-md bg-primary-500 text-white hover:bg-primary-600">Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default RecurringEditModal;
