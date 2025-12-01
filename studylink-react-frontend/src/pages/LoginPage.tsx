import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, type LoginRequest } from '../api/apiService';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';
import type { AxiosError } from 'axios';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login: authContextLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const loginCredentials: LoginRequest = { email, password };
      const response = await login(loginCredentials);
      localStorage.setItem('jwt_token', response.data.accessToken);
      authContextLogin(response.data.accessToken);
      navigate('/');
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || '이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">환영합니다!</h1>
          <p className="auth-subtitle">로그인하고 학습 여정을 계속하세요.</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">이메일 주소</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
              className="form-input"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            아직 계정이 없으신가요? <Link to="/signup" className="auth-link">회원가입</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;