"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type ProfileActivityContextValue = {
  refreshActivity: () => void;
  refreshKey: number;
};

const ProfileActivityContext =
  createContext<ProfileActivityContextValue | null>(null);

export function ProfileActivityProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);

  function refreshActivity() {
    setRefreshKey((current) => current + 1);
  }

  return (
    <ProfileActivityContext.Provider value={{ refreshActivity, refreshKey }}>
      {children}
    </ProfileActivityContext.Provider>
  );
}

export function useProfileActivity() {
  const context = useContext(ProfileActivityContext);

  if (!context) {
    throw new Error(
      "useProfileActivity must be used inside ProfileActivityProvider",
    );
  }

  return context;
}
