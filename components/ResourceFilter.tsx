import React, { useState, useMemo } from 'react';
import { Resource, ResourceType } from '../types';
import * as Icons from './icons';

interface ResourceFilterProps {
  resources: Resource[];
  selectedResourceIds: string[];
  onFilterChange: (selectedIds: string[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ResourceFilter: React.FC<ResourceFilterProps> = ({ resources, selectedResourceIds, onFilterChange, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<ResourceType | 'all'>('all');

  const filteredResources = useMemo(() => {
    if (activeTab === 'all') return resources;
    return resources.filter(r => r.type === activeTab);
  }, [resources, activeTab]);

  const handleCheckboxChange = (resourceId: string) => {
    const newSelection = selectedResourceIds.includes(resourceId)
      ? selectedResourceIds.filter(id => id !== resourceId)
      : [...selectedResourceIds, resourceId];
    onFilterChange(newSelection);
  };

  const TabButton: React.FC<{ tabId: ResourceType | 'all'; label: string }> = ({ tabId, label }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 text-sm font-medium rounded-md flex-1 transition-colors ${
        activeTab === tabId
          ? 'bg-primary-500 text-white shadow'
          : 'text-text-dark-secondary hover:bg-border-dark'
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
        <aside
            className={`fixed inset-y-0 left-0 z-40 w-64 bg-card-dark p-4 flex-shrink-0 border-r border-border-dark transform transition-transform md:relative md:translate-x-0 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-dark-primary">Resources</h2>
                <button onClick={onClose} className="md:hidden p-1 rounded-full hover:bg-background-dark">
                    <Icons.XIcon className="w-5 h-5" />
                </button>
            </div>
            
            <div className="flex space-x-2 mb-4 p-1 bg-background-dark rounded-lg">
                <TabButton tabId="all" label="All" />
                <TabButton tabId="facility" label="Facilities" />
                <TabButton tabId="trainer" label="Trainers" />
            </div>

            <div className="relative mb-4">
                <Icons.SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dark-secondary" />
                <input type="text" placeholder="Search resources..." className="pl-10 p-2 w-full bg-background-dark rounded-md text-sm border border-border-dark focus:ring-primary-500 focus:border-primary-500" />
            </div>

            <div className="space-y-2 h-64 overflow-y-auto">
                {filteredResources.map(resource => (
                <label key={resource.id} className="flex items-center p-2 rounded-md hover:bg-background-dark cursor-pointer">
                    <input
                    type="checkbox"
                    checked={selectedResourceIds.includes(resource.id)}
                    onChange={() => handleCheckboxChange(resource.id)}
                    className="h-4 w-4 rounded border-border-dark bg-background-dark text-primary-500 focus:ring-primary-500 focus:ring-offset-card-dark"
                    />
                    <span className="ml-3 text-sm text-text-dark-secondary">{resource.name}</span>
                </label>
                ))}
            </div>
        </aside>
        {isOpen && (
            <div
            className="fixed inset-0 z-30 bg-black opacity-50 md:hidden"
            onClick={onClose}
            ></div>
      )}
    </>
  );
};

export default ResourceFilter;