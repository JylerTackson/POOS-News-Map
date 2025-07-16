import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from "react";

// User Interface
import type { User } from "../Types/Users";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

// 2) Create the context with an undefined default
const UserContext = createContext<UserContextType | undefined>(undefined);

// 3) Provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  // try re‑hydrating from localStorage so login persists on refresh
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  });

  // keep localStorage in sync
  useEffect(() => {
    if (user) localStorage.setItem("currentUser", JSON.stringify(user));
    else localStorage.removeItem("currentUser");
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// 4) Custom hook for easy consumption
export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};
