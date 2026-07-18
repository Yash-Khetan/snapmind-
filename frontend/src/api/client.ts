const HOST_URL = import.meta.env.VITE_API_URL; 
const API_BASE = `${HOST_URL}/api`;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  return localStorage.getItem("snapmind_token");
}

export function setToken(token: string): void {
  localStorage.setItem("snapmind_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("snapmind_token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const body = await response.json();
      if (body.detail) {
        message = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
      }
    } catch {
      // Response body is not JSON
    }
    throw new ApiError(message, response.status);
  }
  return response.json();
}

export async function apiGet<T>(path: string): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { headers });
  return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

export async function apiPostFormData<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });
  return handleResponse<T>(response);
}

export function getImageUrl(filepath: string): string {
  if (filepath.startsWith("http://") || filepath.startsWith("https://")) {
    return filepath;
  }
  // filepath is like "images/abc123.png", backend serves at /images/<filename>
  return `${HOST_URL}/${filepath}`;
}
