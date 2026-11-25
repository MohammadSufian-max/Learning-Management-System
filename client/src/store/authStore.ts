
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type UserRole = "admin" | "instructor" | "student";

interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  status?: "active" | "inactive";
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  setAuth: (user: User, accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken) =>
        set({
          user,
          accessToken,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "lms-auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
