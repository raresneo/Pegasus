import { MenuItem } from '../types';

/**
 * Finds a menu item by its ID, searching recursively through children.
 * @param items - The array of menu items to search.
 * @param id - The ID of the menu item to find.
 * @returns The found menu item or undefined.
 */
export const findMenuItemById = (items: MenuItem[], id: string): MenuItem | undefined => {
    for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
            const foundInChildren = findMenuItemById(item.children, id);
            if (foundInChildren) return foundInChildren;
        }
    }
    return undefined;
};
