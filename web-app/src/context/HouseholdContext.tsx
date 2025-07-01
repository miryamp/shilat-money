import React, { createContext, useContext } from 'react';

interface HouseholdContextType {
  householdId: string;
}

const HouseholdContext = createContext<HouseholdContextType>({ householdId: 'mainhousehold' });

export const HouseholdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // In the future, householdId can be set from login/session
  const value = { householdId: 'mainhousehold' };
  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>;
};

export const useHousehold = () => useContext(HouseholdContext);
