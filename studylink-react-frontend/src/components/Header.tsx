// src/components/Header.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../contexts/SearchContext';
import { useState, useEffect } from 'react';
import './Header.css'; // Header 전용 CSS 파일

function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { searchTerm, setSearchTerm } = useSearch();

  const [localSearchInput, setLocalSearchInput] = useState<string>('');

  useEffect(() => {
    setLocalSearchInput(searchTerm);
  }, [searchTerm]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => { // MouseEvent 대신 FormEvent로 통일
    e.preventDefault();
    if (localSearchInput.trim()) {
      navigate(`/search?query=${localSearchInput.trim()}`);
      setLocalSearchInput('');
      setSearchTerm('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* 로고: StudyLink 텍스트를 이미지나 더 스타일리쉬한 형태로 변경 가능 */}
        <Link to="/" className="logo" onClick={() => setSearchTerm('')}>
          {/* <img src="/path/to/your/logo-blue.svg" alt="StudyLink Logo" /> */}
          StudyLink
        </Link>

        {/* 검색창 */}
        <form onSubmit={handleSearchSubmit} className="search-bar">
          <input
            type="text"
            placeholder="관심 스터디를 검색해보세요..."
            value={localSearchInput}
            onChange={handleSearchInputChange}
            onKeyDown={handleKeyDown}
          />
          <button type="submit" className="search-button"> {/* 클래스 추가 */}
            <i className="fas fa-search"></i> {/* Font Awesome 검색 아이콘 */}
            {/* <span>검색</span> // '검색' 텍스트를 원하면 이것 사용 */}
          </button>
        </form>

        {/* 내비게이션 */}
        <nav className="navigation">
          {isAuthenticated ? (
            <>
              <button onClick={() => navigate('/mypage')} className="nav-button">마이페이지</button> {/* 클래스 추가 */}
              <button onClick={logout} className="nav-button nav-button-logout">로그아웃</button> {/* 클래스 추가 */}
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="nav-button primary-button">로그인</button> {/* 클래스 추가 및 primary */}
              <button onClick={() => navigate('/signup')} className="nav-button secondary-button">회원가입</button> {/* 클래스 추가 및 secondary */}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;