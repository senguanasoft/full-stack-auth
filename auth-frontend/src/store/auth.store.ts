// src/store/auth.store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { api } from "../config/api";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthTokens,
} from "../types/auth";
import { TokenService } from "../services/token.service";
import toast from "react-hot-toast";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (credentials) => {
        try {
          const tokens: AuthTokens = await api
            .post("/auth/login", credentials)
            .then((res) => res.data);
          TokenService.setAccessToken(tokens.accessToken);

          const userData: User = await api
            .get("/auth/me")
            .then((res) => res.data);
          set({ user: userData, isAuthenticated: true });
          toast.success("Login successful!");
        } catch (error: any) {
          const message = error?.response?.data?.message || "Login failed";
          toast.error(message);
          throw error;
        }
      },

      register: async (credentials) => {
        try {
          await api.post("/auth/register", credentials);
          toast.success("Registration successful! Please log in.");
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Registration failed";
          toast.error(message);
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
          TokenService.removeAccessToken();
          set({ user: null, isAuthenticated: false });
          toast.success("Logged out successfully");
        } catch (error) {
          console.error("Logout error:", error);
        }
      },

      refreshToken: async () => {
        try {
          const response = await api.post("/auth/refresh");
          const { accessToken } = response.data;
          TokenService.setAccessToken(accessToken);
        } catch (error) {
          TokenService.removeAccessToken();
          set({ user: null, isAuthenticated: false });
          throw error;
        }
      },

      initializeAuth: async () => {
        set({ isLoading: true });
        try {
          const token = TokenService.getAccessToken();
          if (token) {
            const userData: User = await api
              .get("/auth/me")
              .then((res) => res.data);
            set({ user: userData, isAuthenticated: true });
          }
        } catch (error) {
          TokenService.removeAccessToken();
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
