import { apiPost, apiGet } from "./client";
import type { AuthResponse, User } from "../types";

export function login(email: string, password: string): Promise<AuthResponse> {
  return apiPost<AuthResponse>("/auth/login", { email, password });
}

export function register(name: string, email: string, password: string): Promise<AuthResponse> {
  return apiPost<AuthResponse>("/auth/register", { name, email, password });
}

export function getMe(): Promise<User> {
  return apiGet<User>("/auth/me");
}
