// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // AuthContext에서 인증 상태 확인

interface PrivateRouteProps {
  children: React.ReactNode; // 렌더링할 자식 컴포넌트
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth(); // useAuth 훅에서 인증 상태와 로딩 상태 가져오기

  // 인증 상태를 확인 중이라면 로딩 UI를 표시 (선택 사항)
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'lightgray', border: '2px solid blue' }}>
        <h1>인증 상태 확인 중...</h1>
        <p>잠시만 기다려 주세요.</p>
      </div>
    );
  }

  // 인증된 사용자라면 요청한 자식 컴포넌트를 렌더링
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // 인증되지 않았다면 로그인 페이지로 리다이렉트
  return <Navigate to="/login" replace />;
};

export default PrivateRoute;