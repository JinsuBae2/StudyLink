// src/pages/HomePage.tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getStudyGroups, type StudyGroup } from '../api/apiService';
import './HomePage.css'; // 👈 CSS 파일 import

function HomePage() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [popularGroups, setPopularGroups] = useState<StudyGroup[]>([]);
  const [deadlineGroups, setDeadlineGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [popularRes, deadlineRes] = await Promise.all([
          getStudyGroups({ sort: 'popular' }),
          getStudyGroups({ sort: 'deadline' }),
        ]);
        setPopularGroups(popularRes.data);
        setDeadlineGroups(deadlineRes.data);
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="home-container">
      <header className="app-bar">
        <h1 className="app-bar-title">StudyLink</h1>
        <nav className="app-bar-nav">
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
      </header>

      <main className="main-content">
        {loading ? (
          <div className="loading-spinner">
            <p>로딩 중...</p> {/* 간단한 로딩 스피너 대신 텍스트로 대체 */}
          </div>
        ) : (
          <>
            <h2 className="section-title">🔥 인기 스터디</h2>
            <StudyGroupSection groups={popularGroups} />

            <h2 className="section-title" style={{ marginTop: '40px' }}>⏰ 마감 임박 스터디</h2>
            <StudyGroupSection groups={deadlineGroups} />
          </>
        )}
      </main>
    </div>
  );
}

// 스터디 카드 UI를 위한 재사용 컴포넌트
const StudyGroupSection = ({ groups }: { groups: StudyGroup[] }) => (
  <div className="study-group-grid">
    {groups.length > 0 ? (
      groups.map(group => (
        <Link to={`/study/${group.id}`} key={group.id} className="study-group-card">
          <div className="card-content">
            <h3 className="card-title">{group.title}</h3>
            <p className="card-description">{group.topic}</p>
            <div className="card-chips">
              <span className="chip">리더: {group.creatorNickname}</span>
              <span className="chip">마감: {group.recruitmentDeadline}</span>
            </div>
          </div>
        </Link>
      ))
    ) : (
      <p style={{ padding: '20px' }}>해당 스터디가 없습니다.</p>
    )}
  </div>
);

export default HomePage;