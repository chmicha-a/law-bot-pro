// API Service for backend integration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface Message {
  question: string;
}

export interface AskResponse {
  answer: string;
  sources: Array<{
    doc_name: string;
    page: number;
  }>;
  disclaimer: string;
}

export interface Document {
  filename: string;
  path: string;
  category?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

// Authentication API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const formData = new FormData();
    formData.append("username", credentials.email);
    formData.append("password", credentials.password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Login failed");
    }

    return response.json();
  },
};

// Chat API
export const chatApi = {
  ask: async (question: string): Promise<AskResponse> => {
    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to get answer");
    }

    return response.json();
  },
};

// Document API
export const documentApi = {
  list: async (): Promise<Document[]> => {
    const response = await fetch(`${API_BASE_URL}/documents`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch documents");
    }

    const data = await response.json();
    return data.documents;
  },

  upload: async (file: File, category: string): Promise<{ filename: string; path: string; category: string; message: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    return response.json();
  },

  delete: async (filename: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/delete/${filename}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Delete failed");
    }
  },
};
