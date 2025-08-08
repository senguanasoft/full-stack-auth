// src/services/token.service.ts
export const TokenService = {
  getAccessToken: (): string | null => {
    return localStorage.getItem("accessToken");
  },
  setAccessToken: (token: string): void => {
    localStorage.setItem("accessToken", token);
  },
  removeAccessToken: (): void => {
    localStorage.removeItem("accessToken");
  },
};
