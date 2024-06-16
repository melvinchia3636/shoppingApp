import React, { createContext, useState, useEffect } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
  token: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  token: null,
  isLoading: true,
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function verifyToken() {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      await fetch("http://localhost:3001/verify", {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      }).then((response) => {
        if (response.ok) {
          setToken(storedToken);
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem("authToken");
        }
      });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    verifyToken();
  }, []);

  const login = (token: string) => {
    localStorage.setItem("authToken", token);
    setToken(token);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, login, logout, token, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
