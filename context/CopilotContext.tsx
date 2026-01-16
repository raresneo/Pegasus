import React, { createContext, useContext } from 'react';
import { CopilotAction } from '../types';

interface CopilotContextType {
  actions: CopilotAction[];
  registerActions: (newActions: CopilotAction[]) => void;
  unregisterActions: () => void;
}

export const CopilotContext = createContext<CopilotContextType | undefined>(undefined);

export const useCopilot = () => {
  const context = useContext(CopilotContext);
  if (!context) {
    throw new Error('useCopilot must be used within a CopilotProvider');
  }
  return context;
};
