import React, { createContext, useContext, useEffect, useState } from "react";

type AdminAuthContextType = {
  adminToken: string;
  adminLogin: (token: string) => void;
  adminLogout: () => void;
  isAdminAuthed: boolean;
};

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminToken, setAdminToken] = useState<string>(() => localStorage.getItem("adminToken") || "");

  const adminLogin = (token: string) => {
    localStorage.setItem("adminToken", token);
    setAdminToken(token);
  };

  const adminLogout = () => {
    localStorage.removeItem("adminToken");
    setAdminToken("");
  };

  // keep in sync across tabs (optional but good)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "adminToken") setAdminToken(e.newValue || "");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{ adminToken, adminLogin, adminLogout, isAdminAuthed: Boolean(adminToken) }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}