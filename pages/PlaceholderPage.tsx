import React from 'react';
import * as Icons from '../components/icons';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
      <Icons.DocumentTextIcon className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
      <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-200">{title}</h1>
      <p className="mt-2">This page is under construction.</p>
    </div>
  );
};

export default PlaceholderPage;