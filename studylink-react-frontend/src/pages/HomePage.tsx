import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getStudyGroups,
  type StudyGroupListResponse,
  getRecommendedStudyGroupsV2,
  type RecommendedStudyGroup
} from '../api/apiService';
import { useSearch } from '../contexts/SearchContext';
import { useAuth } from '../contexts/AuthContext';
import './HomePage.css';

function HomePage() {
  const { searchTerm, setSearchTerm } = useSearch();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [popularGroups, setPopularGroups] = useState<StudyGroupListResponse[]>([]);
  const [deadlineGroups, setDeadlineGroups] = useState<StudyGroupListResponse[]>([]);
  const [recommendedGroups, setRecommendedGroups] = useState<RecommendedStudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      setError(null);
      setLoading(true);

      try {
        const [popularRes, deadlineRes] = await Promise.all([
          getStudyGroups({ sort: 'popular' }),
          getStudyGroups({ sort: 'deadline' }),
        ]);

        setPopularGroups(popularRes.data);
        setDeadlineGroups(deadlineRes.data);

        if (isAuthenticated) {
          try {
            const recommendedRes = await getRecommendedStudyGroupsV2();
            setRecommendedGroups(recommendedRes.data);
          } catch (recErr) {
            console.warn("Recommended studies load failed:", recErr);
            setRecommendedGroups([]);
          }
        } else {
          setRecommendedGroups([]);
        }
      } catch (err) {
        console.error("Home data load failed:", err);
        setError('Failed to load study groups.');
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (searchTerm) {
      navigate(`/search?query=${searchTerm}`);
      setSearchTerm('');
    }
  }, [searchTerm, navigate, setSearchTerm]);

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (error) return <div className="error-container">{error}</div>;

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-content">
          <h1 className="hero-title">
            당신의 완벽한 <span className="text-primary">스터디 그룹</span>을 찾아보세요
          </h1>
          <p className="hero-subtitle">
            같은 목표를 가진 사람들과 연결되어 지식을 공유하고 함께 성장하세요.
            StudyLink와 함께 목표를 달성하는 수천 명의 학생들과 함께하세요.
          </p>
          <div className="hero-actions">
            <Link to="/study/create" className="btn btn-primary text-lg px-6 py-3">
              스터디 만들기
            </Link>
            <Link to="/search" className="btn btn-outline text-lg px-6 py-3">
              전체 둘러보기
            </Link>
          </div>
        </div>
      </section>

      <div className="container main-content">
        {/* Recommended Section */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">맞춤 추천 스터디</h2>
            <Link to="/search?sort=recommended" className="section-link">전체보기</Link>
          </div>
          
          {!isAuthenticated ? (
            <div className="empty-state">
              <div className="empty-icon">🔒</div>
              <h3>로그인하고 추천 스터디를 확인하세요</h3>
              <p>관심사에 맞는 스터디 그룹을 추천해 드립니다.</p>
              <Link to="/login" className="btn btn-primary mt-4">로그인</Link>
            </div>
          ) : recommendedGroups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedGroups.map(group => (
                <StudyCard key={group.id} group={group} type="recommended" />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <h3>아직 추천 스터디가 없습니다</h3>
              <p>마이페이지에서 관심사를 업데이트하고 맞춤 추천을 받아보세요.</p>
              <Link to="/mypage" className="btn btn-outline mt-4">관심사 설정</Link>
            </div>
          )}
        </section>

        {/* Popular Section */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">인기 스터디</h2>
            <Link to="/search?sort=popular" className="section-link">전체보기</Link>
          </div>
          {popularGroups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularGroups.map(group => (
                <StudyCard key={group.id} group={group} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>현재 인기 스터디가 없습니다.</p>
            </div>
          )}
        </section>

        {/* Deadline Section */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">마감 임박 스터디</h2>
            <Link to="/search?sort=deadline" className="section-link">전체보기</Link>
          </div>
          {deadlineGroups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {deadlineGroups.map(group => (
                <StudyCard key={group.id} group={group} isDeadline />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>마감 임박한 스터디가 없습니다.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Study Card Component
function StudyCard({ group, type, isDeadline }: { group: any, type?: string, isDeadline?: boolean }) {
  const deadline = group.recruitmentDeadLine || group.recruitmentDeadline;
  
  return (
    <Link to={`/study/${group.id}`} className="study-card">
      <div className="card-badge">{group.topic}</div>
      <div className="card-content">
        <h3 className="card-title">{group.title}</h3>
        <div className="card-meta">
          <span className="meta-item">
            <i className="fas fa-user"></i> {group.creatorNickname}
          </span>
          <span className={`meta-item ${isDeadline ? 'text-error' : ''}`}>
            <i className="fas fa-calendar"></i> {deadline ? new Date(deadline).toLocaleDateString() : '미정'}
          </span>
        </div>
        
        {type === 'recommended' && group.matchScore && (
          <div className="match-bar-container">
            <div className="match-bar">
              <div className="match-fill" style={{ width: `${group.matchScore}%` }}></div>
            </div>
            <span className="match-text">매칭: {Math.round(group.matchScore)}%</span>
          </div>
        )}
      </div>
      <div className="card-footer">
        <span className="view-more">자세히 보기 <i className="fas fa-arrow-right"></i></span>
      </div>
    </Link>
  );
}

export default HomePage;