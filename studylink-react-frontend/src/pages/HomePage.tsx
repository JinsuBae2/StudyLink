// src/pages/HomePage.tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate 임포트
import { getStudyGroups, type StudyGroupListResponse, getRecommendedStudyGroupsV2, type RecommendedStudyGroup } from '../api/apiService'; // 추천 스터디 API 임포트
import { useSearch } from '../contexts/SearchContext'; // SearchContext 임포트
import './HomePage.css';

function HomePage() {
  const { searchTerm, setSearchTerm } = useSearch();
  const navigate = useNavigate(); // useNavigate 훅 사용

  const [popularGroups, setPopularGroups] = useState<StudyGroupListResponse[]>([]);
  const [deadlineGroups, setDeadlineGroups] = useState<StudyGroupListResponse[]>([]);
  const [recommendedGroups, setRecommendedGroups] = useState<RecommendedStudyGroup[]>([]); // 추천 스터디
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      setError(null);
      setLoading(true);

      try {
        const [popularRes, deadlineRes, recommendedRes] = await Promise.all([
          getStudyGroups({ sort: 'popular' }),
          getStudyGroups({ sort: 'deadline' }),
          getRecommendedStudyGroupsV2(), // v2 추천 API 사용
        ]);
        setPopularGroups(popularRes.data);
        setDeadlineGroups(deadlineRes.data);
        setRecommendedGroups(recommendedRes.data);
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
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 검색어가 변경될 때 SearchResultPage로 리다이렉트
  useEffect(() => {
    if (searchTerm) {
      navigate(`/search?query=${searchTerm}`);
      setSearchTerm(''); // 검색 후 검색창 초기화
    }
  }, [searchTerm, navigate, setSearchTerm]);


  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="home-container">
      <main className="main-content">
        {/* 추천 스터디 섹션 */}
        <h2 className="section-title">✨ 맞춤 추천 스터디</h2>
        <RecommendedStudyGroupSection groups={recommendedGroups} />
        {recommendedGroups.length === 0 && (
          <p style={{ textAlign: 'center', padding: '20px' }}>현재 추천 스터디가 없습니다.</p>
        )}

        {/* 인기 스터디 섹션 */}
        <h2 className="section-title" style={{ marginTop: '40px' }}>🔥 인기 스터디</h2>
        <StudyGroupSection groups={popularGroups} />
        {popularGroups.length === 0 && (
          <p style={{ textAlign: 'center', padding: '20px' }}>현재 인기 스터디가 없습니다.</p>
        )}

        {/* 마감 임박 스터디 섹션 */}
        <h2 className="section-title" style={{ marginTop: '40px' }}>⏰ 마감 임박 스터디</h2>
        <StudyGroupSection groups={deadlineGroups} />
        {deadlineGroups.length === 0 && (
          <p style={{ textAlign: 'center', padding: '20px' }}>현재 마감 임박 스터디가 없습니다.</p>
        )}
      </main>
    </div>
  );
}

// 일반 스터디 카드 UI (StudyGroupListResponse 기반)
const StudyGroupSection = ({ groups }: { groups: StudyGroupListResponse[] }) => (
  <div className="study-group-grid">
    {groups.length > 0 ? (
      groups.map(group => (
        <Link to={`/study/${group.id}`} key={group.id} className="study-group-card">
          <div className="card-content">
            <h3 className="card-title">{group.title}</h3>
            <p className="card-description">{group.topic}</p>
            <div className="card-chips">
              <span className="chip">리더: {group.creatorNickname}</span>
              <span className="chip">
                마감: {group.recruitmentDeadline ? new Date(group.recruitmentDeadline).toLocaleDateString() : '미정'}
              </span>
            </div>
          </div>
        </Link>
      ))
    ) : (
      null
    )}
  </div>
);

// 추천 스터디 카드 UI (RecommendedStudyGroup 기반)
const RecommendedStudyGroupSection = ({ groups }: { groups: RecommendedStudyGroup[] }) => (
  <div className="study-group-grid">
    {groups.length > 0 ? (
      groups.map(group => (
        <Link to={`/study/${group.id}`} key={group.id} className="study-group-card">
          <div className="card-content">
            <h3 className="card-title">{group.title}</h3>
            <p className="card-description">{group.topic}</p>
            <div className="card-chips">
              <span className="chip">리더: {group.creatorNickname}</span>
              <span className="chip">
                마감: {group.recruitmentDeadLine ? new Date(group.recruitmentDeadLine).toLocaleDateString() : '미정'}
              </span>
              {/* 추천 점수가 있다면 표시 */}
              {group.matchScore !== undefined && (
                <span className="chip match-score">매칭: {group.matchScore}%</span>
              )}
            </div>
          </div>
        </Link>
      ))
    ) : (
      null
    )}
  </div>
);


export default HomePage;