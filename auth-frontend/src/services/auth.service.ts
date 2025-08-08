// src/services/auth.service.ts
import { api } from "../config/api";
import type {
  AuthTokens,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "../types/auth";

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  }

  static async register(credentials: RegisterCredentials): Promise<User> {
    const response = await api.post("/auth/register", credentials);
    return response.data;
  }

  static async logout(): Promise<void> {
    await api.post("/auth/logout");
  }

  static async getProfile(): Promise<User> {
    const response = await api.get("/auth/me");
    return response.data;
  }

  static async refreshToken(): Promise<AuthTokens> {
    const response = await api.post("/auth/refresh");
    return response.data;
  }

  static async forgotPassword(email: string): Promise<void> {
    await api.post("/auth/forgot-password", { email });
  }

  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    await api.post(`/auth/reset-password/${token}`, { newPassword });
  }

  static getGoogleAuthUrl(): string {
    return `${
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
    }/auth/google`;
  }
}
