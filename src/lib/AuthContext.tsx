import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from 'react';

interface User {
  _id: string;
  email: string;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  token: string | null;
  login: (authToken: string) => Promise<void>;  // ✅ Add this
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  token: null,
  login: async () => {},  // ✅ Add this
  signOut: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (authToken: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      if (!res.ok) throw new Error('Unauthorized');

      const data = await res.json();

      setUser(data.user);
      setIsAdmin(data.user?.is_admin || false);
      setToken(authToken);
    } catch (err) {
      console.error('Auth error:', err);
      localStorage.removeItem('token');
      setUser(null);
      setIsAdmin(false);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add login function
  const login = async (authToken: string) => {
    localStorage.setItem('token', authToken);
    await fetchUser(authToken);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const signOut = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAdmin(false);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAdmin, loading, token, login, signOut }}  // ✅ Add login
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}