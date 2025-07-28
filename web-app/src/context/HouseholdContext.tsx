import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

interface HouseholdContextType {
  householdId: string | null;
}

const HouseholdContext = createContext<HouseholdContextType>({ householdId: null });

export const HouseholdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const value = { householdId: user?.householdId || null };
  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>;
};

export const useHousehold = () => useContext(HouseholdContext);
