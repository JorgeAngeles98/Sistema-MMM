import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api, getToken, setToken, clearToken } from "./api";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // nombre completo para mostrar
  email: string;
  phone?: string;
  role: string;
  permissions: string[];
  isActive?: boolean;
  isSystem?: boolean;
  lastLogin?: string | null;
  createdAt?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType>(null as never);

export const useAuth = (): AuthContextType => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Al cargar, si hay token guardado, restaura la sesión.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api<{ user: User }>("/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const d = await api<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(d.token);
    setUser(d.user);
  }

  function logout(): void {
    clearToken();
    setUser(null);
  }

  // Recarga los datos del usuario (p. ej. tras editar el perfil).
  async function refreshUser(): Promise<void> {
    const d = await api<{ user: User }>("/auth/me");
    setUser(d.user);
  }

  const hasPermission = (permission: string): boolean =>
    !!user?.permissions.includes(permission);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, refreshUser, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}
