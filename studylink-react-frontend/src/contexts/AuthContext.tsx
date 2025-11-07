// src/contexts/AuthContext.tsx
import { createContext, useState, useContext, useEffect, type ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode, type JwtPayload } from 'jwt-decode';

// 커스텀 JwtPayload 타입 정의 (백엔드 토큰에 userId와 userNickname이 있다고 가정)
// 백엔드 JwtTokenProvider의 subject에 email만 담겨 있으므로, userId와 userNickname은 토큰에 없을 수 있음.
// 실제 백엔드에서 userId와 userNickname을 토큰에 담는다면 이 주석을 제거하고 사용.
interface CustomJwtPayload extends JwtPayload {
  // userId?: number; // 현재 백엔드 토큰에는 userId가 없음 (Subject에 email만)
  // userNickname?: string; // 현재 백엔드 토큰에는 userNickname이 없음
  sub?: string; // subject (이메일)
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  getUserId: () => number | null; // 현재 토큰에 ID가 없으므로 항상 null 반환할 수 있음
  getUserEmail: () => string | null; // email 반환 함수 추가
  getUserNickname: () => string | null; // 현재 토큰에 닉네임이 없으므로 항상 null 반환할 수 있음
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('jwt_token') !== null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  // 백엔드 JwtTokenProvider에서 subject에 email만 담고 있으므로 userId 대신 userEmail 사용
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  // userId와 nickname은 토큰에 직접 없으므로 초기값 null 유지
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserNickname, setCurrentUserNickname] = useState<string | null>(null);


  const getUserId = useCallback((): number | null => currentUserId, [currentUserId]);
  const getUserEmail = useCallback((): string | null => currentUserEmail, [currentUserEmail]); // email 반환 함수
  const getUserNickname = useCallback((): string | null => currentUserNickname, [currentUserNickname]);

  const navigate = useNavigate();

  const login = (token: string) => {
    localStorage.setItem('jwt_token', token);
    setIsAuthenticated(true);
    
    try {
      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      // 백엔드 JwtTokenProvider는 subject에 email을 담으므로 email을 추출
      setCurrentUserEmail(decodedToken.sub || null);
      // userId와 userNickname은 토큰에 직접 없으므로 null 유지 (필요하다면 백엔드 수정 필요)
      setCurrentUserId(null); // 토큰에 userId 필드가 없으므로 null
      setCurrentUserNickname(null); // 토큰에 userNickname 필드가 없으므로 null
    } catch (e) {
      console.error("Failed to decode token on login:", e);
      setCurrentUserEmail(null);
      setCurrentUserId(null);
      setCurrentUserNickname(null);
    }
    navigate('/'); 
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setIsAuthenticated(false);
    setCurrentUserEmail(null);
    setCurrentUserId(null);
    setCurrentUserNickname(null);
    navigate('/login');
  };

  // 컴포넌트 마운트 시 토큰 존재 여부만 확인하고, 실제 유효성 검사는 Axios 인터셉터에 맡김
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const decodedToken = jwtDecode<CustomJwtPayload>(token);
        // 토큰 만료 여부만 프론트에서 간단히 체크 (필수 아님, 백엔드 인터셉터가 더 정확)
        if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
          console.warn("Token expired on client side, logging out.");
          logout(); // 만료된 토큰이면 로그아웃
        } else {
          setIsAuthenticated(true);
          setCurrentUserEmail(decodedToken.sub || null);
          setCurrentUserId(null); // 토큰에 userId 필드가 없으므로 null
          setCurrentUserNickname(null); // 토큰에 userNickname 필드가 없으므로 null
        }
      } catch (e) {
        console.error("Failed to decode token on mount:", e);
        logout(); // 토큰 디코딩 실패 시 로그아웃 (손상된 토큰)
      }
    } else {
      setIsAuthenticated(false);
      setCurrentUserEmail(null);
      setCurrentUserId(null);
      setCurrentUserNickname(null);
    }
    setLoading(false);
  }, []); // 빈 배열은 컴포넌트 마운트 시 한 번만 실행됨


  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, getUserId, getUserEmail, getUserNickname, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// AuthContext를 사용하기 위한 커스텀 훅
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};