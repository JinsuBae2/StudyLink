// src/contexts/AuthContext.tsx
import { createContext, useState, useContext, useEffect, type ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// jwt-decode는 이제 만료 시간 확인용으로만 사용합니다.
import { jwtDecode } from 'jwt-decode';
// 🌟 getUserProfile API를 임포트합니다.
import { getMyProfile } from '../api/apiService';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  getUserId: () => number | null;
  getUserNickname: () => string | null;
  getUserEmail: () => string | null; // 이메일 반환 함수도 유지
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 초기화 시 토큰 유무만 확인
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('jwt_token') !== null;
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserNickname, setCurrentUserNickname] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const navigate = useNavigate();

  // 🌟 내 정보를 서버에서 가져오는 함수 (핵심!)
  const fetchMe = async () => {
    try {
      const response = await getMyProfile(); // 백엔드에 "나 누구야?" 하고 물어봄
      setCurrentUserId(response.data.id); // 진짜 ID 저장
      setCurrentUserNickname(response.data.nickname);
      setCurrentUserEmail(response.data.email);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("사용자 정보 불러오기 실패:", error);
      logout(); // 정보 로드 실패 시 로그아웃 처리
    }
  };

  const login = (token: string) => {
    localStorage.setItem('jwt_token', token);
    setIsAuthenticated(true);
    // 로그인 직후 내 정보 가져오기 실행
    fetchMe();
    navigate('/'); 
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setIsAuthenticated(false);
    setCurrentUserId(null);
    setCurrentUserNickname(null);
    setCurrentUserEmail(null);
    navigate('/login');
  };

  // 앱 시작(새로고침) 시 실행
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        try {
          // 1. 토큰 만료 체크 (클라이언트 측)
          const decoded: any = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            throw new Error("Token expired");
          }
          // 이메일은 토큰에도 있으므로 미리 세팅 가능
          setCurrentUserEmail(decoded.sub || null);

          // 2. 토큰이 유효해 보이면, 내 실제 정보(ID, 닉네임)를 서버에 요청
          // 이 과정에서 토큰이 위조되었거나 서버에서 만료되었다면 catch로 넘어갑니다.
          await fetchMe();
          
        } catch (error) {
          console.error("인증 초기화 실패:", error);
          logout();
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const getUserId = useCallback(() => currentUserId, [currentUserId]);
  const getUserNickname = useCallback(() => currentUserNickname, [currentUserNickname]);
  const getUserEmail = useCallback(() => currentUserEmail, [currentUserEmail]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, getUserId, getUserNickname, getUserEmail, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};