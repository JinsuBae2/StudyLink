import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // 컴포넌트 마운트 시 localStorage에서 토큰 존재 여부 확인
    return localStorage.getItem('jwt_token') !== null;
  });
  const navigate = useNavigate();

  const login = (token: string) => {
    localStorage.setItem('jwt_token', token);
    setIsAuthenticated(true);
    // 로그인 성공 후 자동으로 메인 페이지로 이동 (이미 LoginPage에서 처리하지만, 여기서는 혹시 모를 경우를 대비)
    navigate('/'); 
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setIsAuthenticated(false);
    // 로그아웃 후 로그인 페이지로 이동
    navigate('/login');
  };

  // 컴포넌트가 처음 렌더링될 때만 실행
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []); // 빈 배열은 컴포넌트 마운트 시 한 번만 실행됨

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// AuthContext를 사용하기 위한 커스텀 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};