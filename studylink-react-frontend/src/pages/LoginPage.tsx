// src/pages/LoginPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { login } from '../api/apiService';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css'; // 👈 CSS 파일 import

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const {login: authContextLogin} = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      localStorage.setItem('jwt_token', response.data.accessToken);
      authContextLogin(response.data.accessToken);
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인 실패');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>로그인</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">이메일 주소</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">
            로그인
          </button>
        </form>
        <p className="signup-link">
          아직 회원이 아니신가요? <Link to="/signup">회원가입</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;