import { createContext } from 'react';

export const TabRefreshContext = createContext({ 
    refreshTabs: () => {},
});