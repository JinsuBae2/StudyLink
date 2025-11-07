// src/components/Header.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../contexts/SearchContext'; // 👈 useSearch 훅 임포트
import { useState, useEffect } from 'react'; // 👈 useState, useEffect 임포트
import './Header.css'; // Header 전용 CSS 파일

function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { searchTerm, setSearchTerm } = useSearch(); // 👈 SearchContext에서 searchTerm과 setSearchTerm 가져오기

  // input 필드의 현재 값을 관리할 로컬 상태 (UI에 바로 반영)
  const [localSearchInput, setLocalSearchInput] = useState<string>('');

  // 전역 searchTerm이 변경될 때 localSearchInput도 업데이트
  useEffect(() => {
    setLocalSearchInput(searchTerm);
  }, [searchTerm]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault(); // 폼 제출의 기본 동작(페이지 새로고침) 방지
    if (localSearchInput.trim()) {
      // 검색어가 있다면 검색 결과 페이지로 이동 (query 파라미터로 검색어 전달)
      navigate(`/search?query=${localSearchInput.trim()}`);
      setLocalSearchInput(''); // 검색 후 input 필드 초기화 (필요에 따라)
      setSearchTerm(''); // SearchContext의 searchTerm도 초기화 (SearchResultPage에서 URL로 관리)
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
        <Link to="/" className="logo" onClick={() => setSearchTerm('')}> {/* 로고 클릭 시 검색어 초기화 */}
          StudyLink
        </Link>

        <form onSubmit={handleSearchSubmit} className="search-bar">
          <input
            type="text"
            placeholder="관심 스터디를 검색해보세요..."
            value={localSearchInput} // 👈 localSearchInput과 바인딩
            onChange={handleSearchInputChange} // 👈 input 값 변경 핸들러
            onKeyDown={handleKeyDown} // 👈 Enter 키 이벤트 핸들러
          />
          <button type="submit">검색</button> {/* 👈 type="submit" 추가 */}
        </form>

        <nav className="navigation">
          {isAuthenticated ? (
            <>
              <button onClick={() => navigate('/mypage')}>마이페이지</button>
              <button onClick={logout}>로그아웃</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')}>로그인</button>
              <button onClick={() => navigate('/signup')}>회원가입</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;