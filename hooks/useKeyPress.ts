import { useEffect } from 'react';

export const useKeyPress = (targetKeys: string[], callback: (event: KeyboardEvent) => void) => {
  useEffect(() => {
    const keydownHandler = (event: KeyboardEvent) => {
      if (targetKeys.includes(event.key)) {
        callback(event);
      }
    };

    window.addEventListener('keydown', keydownHandler);
    return () => {
      window.removeEventListener('keydown', keydownHandler);
    };
  }, [targetKeys, callback]);
};
