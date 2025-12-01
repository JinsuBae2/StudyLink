import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../contexts/SearchContext';
import { useState, useEffect } from 'react';
import './Header.css';

function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { searchTerm, setSearchTerm } = useSearch();
  const [localSearchInput, setLocalSearchInput] = useState<string>('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setLocalSearchInput(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchInput.trim()) {
      navigate(`/search?query=${localSearchInput.trim()}`);
      setLocalSearchInput('');
      setSearchTerm('');
    }
  };

  return (
    <header className={`app-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container header-content">
        <Link to="/" className="logo" onClick={() => setSearchTerm('')}>
          <span className="logo-icon">S</span>
          <span className="logo-text">StudyLink</span>
        </Link>

        <form onSubmit={handleSearchSubmit} className="search-bar">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="관심 스터디를 검색해보세요..."
            value={localSearchInput}
            onChange={handleSearchInputChange}
          />
        </form>

        <nav className="navigation">
          {isAuthenticated ? (
            <>
              <Link to="/mypage" className="btn btn-ghost">마이페이지</Link>
              <button onClick={logout} className="btn btn-outline">로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">로그인</Link>
              <Link to="/signup" className="btn btn-primary">회원가입</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;