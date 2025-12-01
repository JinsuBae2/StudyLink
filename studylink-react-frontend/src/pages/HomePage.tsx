// src/pages/HomePage.tsx
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
import './HomePage.css'; // HomePage 전용 CSS 파일

// 임시 히어로 이미지 (실제 사용 시 적절한 이미지 경로로 변경 필요)
const HERO_IMAGE_URL = 'https://via.placeholder.com/1920x400/4285F4/FFFFFF?text=Enhance+Your+Every+Study+Day';
// 실제 앱에서는 public 폴더에 이미지를 넣고 '/images/hero-bg.jpg' 등으로 사용합니다.

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
            console.warn("추천 스터디 로드 실패 (무시 가능):", recErr);
            setRecommendedGroups([]);
          }
        } else {
          setRecommendedGroups([]);
        }
      } catch (err) {
        console.error("홈페이지 데이터 로딩 실패:", err);
        setError('스터디 목록을 불러오는 데 실패했습니다.');
        setPopularGroups([]);
        setDeadlineGroups([]);
        setRecommendedGroups([]);
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

  if (loading) return <div className="loading-spinner">로딩 중...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="home-wrapper"> {/* 전체 페이지 감싸는 래퍼 */}
      {/* 🚀 메인 히어로 섹션 */}
      <section className="hero-section" style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}>
        <div className="hero-content">
          <h1 className="hero-title">당신의 학습 여정을<br/>StudyLink와 함께 성장시키세요</h1>
          <p className="hero-subtitle">최고의 스터디 그룹을 찾아 학습 효율을 극대화하세요.</p>
          <Link to="/create-study" className="hero-cta-button">
            새로운 스터디 시작하기 <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </section>

      <main className="main-content-area"> {/* 기존 main-content를 감싸는 새로운 영역 */}
        {/* ✨ 맞춤 추천 스터디 섹션 */}
        <section className="study-section">
          <h2 className="section-title"><i className="fas fa-star section-icon"></i> 맞춤 추천 스터디</h2>
          { !isAuthenticated ? (
            <div className="empty-state-card">
              <i className="fas fa-lock fa-3x empty-state-icon"></i>
              <p>로그인하시면 당신만을 위한 맞춤 스터디를 추천해 드려요!</p>
              <Link to="/login" className="primary-button">로그인 하기</Link>
            </div>
          ) : (
            recommendedGroups.length > 0 ? (
              <StudyGroupCardGrid groups={recommendedGroups} type="recommended" />
            ) : (
              <div className="empty-state-card">
                <i className="fas fa-exclamation-circle fa-3x empty-state-icon"></i>
                <p>아직 추천 스터디가 없습니다.<br/>관심사를 추가하면 더 좋은 추천을 받을 수 있어요!</p>
                <Link to="/mypage" className="secondary-button">관심사 설정</Link>
              </div>
            )
          )}
        </section>

        {/* 🔥 인기 스터디 섹션 */}
        <section className="study-section">
          <h2 className="section-title"><i className="fas fa-fire section-icon"></i> 인기 스터디</h2>
          {popularGroups.length > 0 ? (
            <StudyGroupCardGrid groups={popularGroups} type="general" />
          ) : (
            <div className="empty-state-card">
              <i className="fas fa-search-minus fa-3x empty-state-icon"></i>
              <p>현재 인기 스터디가 없습니다.<br/>새로운 스터디를 시작해보는 건 어떠세요?</p>
              <Link to="/study/create" className="primary-button">스터디 개설</Link>
            </div>
          )}
        </section>

        {/* ⏰ 마감 임박 스터디 섹션 */}
        <section className="study-section">
          <h2 className="section-title"><i className="fas fa-hourglass-half section-icon"></i> 마감 임박 스터디</h2>
          {deadlineGroups.length > 0 ? (
            <StudyGroupCardGrid groups={deadlineGroups} type="general" />
          ) : (
            <div className="empty-state-card">
              <i className="fas fa-calendar-times fa-3x empty-state-icon"></i>
              <p>현재 마감 임박 스터디가 없습니다.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// 스터디 카드 그리드 통합 컴포넌트
type StudyGroupCardGridProps = {
  groups: (StudyGroupListResponse | RecommendedStudyGroup)[];
  type: 'general' | 'recommended';
}

const StudyGroupCardGrid = ({ groups, type }: StudyGroupCardGridProps) => (
  <div className="study-group-grid">
    {groups.map(group => (
      <Link to={`/study/${group.id}`} key={group.id} className="study-group-card">
        <div className="card-header">
          <span className="card-topic">{group.topic}</span>
          {/* 이미지가 있다면 여기에 추가할 수 있습니다. <img src={group.imageUrl} alt={group.title} /> */}
        </div>
        <div className="card-body">
          <h3 className="card-title">{group.title}</h3>
          <div className="card-info-group">
            <span className="card-info-item"><i className="fas fa-user"></i> {group.creatorNickname}</span>
            <span className="card-info-item"><i className="fas fa-calendar-alt"></i> {
              'recruitmentDeadLine' in group && group.recruitmentDeadLine
                ? new Date(group.recruitmentDeadLine).toLocaleDateString()
                : 'recruitmentDeadline' in group && group.recruitmentDeadline
                ? new Date(group.recruitmentDeadline).toLocaleDateString()
                : '미정'
            }</span>
          </div>
        </div>
        <div className="card-footer">
          {type === 'recommended' && 'matchScore' in group && group.matchScore !== undefined && (
            <div className="match-score-pill"> {/* 새로운 매칭 점수 컴포넌트 */}
              <div
                className="match-score-fill"
                style={{ width: `${Math.round(group.matchScore)}%` }}
              ></div>
              <span className="match-score-text">매칭: {Math.round(group.matchScore)}%</span>
            </div>
          )}
          <button className="view-details-button">자세히 보기 <i className="fas fa-chevron-right"></i></button>
        </div>
      </Link>
    ))}
  </div>
);

export default HomePage;