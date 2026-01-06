// src/pages/SearchResultPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getStudyGroups, type StudyGroupListResponse } from '../api/apiService';
import './SearchResultPage.css'; // 검색 결과 페이지 전용 CSS (필요 시 생성)
import { useSearch } from '../contexts/SearchContext'; // SearchContext 임포트

function SearchResultPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || ''; // URL에서 검색어 가져오기
  const { setSearchTerm } = useSearch(); // SearchContext에서 setSearchTerm 가져오기

  const [searchResults, setSearchResults] = useState<StudyGroupListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 필터 상태 (Filter States)
  const [region, setRegion] = useState('');
  const [topic, setTopic] = useState('');
  const [studyStyle, setStudyStyle] = useState('');
  const [recruiting, setRecruiting] = useState(false);

  // 주제(Topic) 입력 시 디바운싱(Debounce)을 적용하여 불필요한 API 호출을 줄일 수 있지만,
  // 현재는 사용자가 입력할 때마다 즉시 필터링되도록 구현합니다 (useEffect 의존성 배열 사용).
  // "통합 검색" 요구사항에 맞춰, 검색어(query)나 필터 조건이 변경될 때마다 즉시 결과를 가져옵니다.

  useEffect(() => {
    // SearchContext의 searchTerm도 동기화
    setSearchTerm(query);

    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        // 검색어가 없으면 전체 목록 조회, 있으면 검색어로 조회 + 필터 적용
        const response = await getStudyGroups({ 
          search: query,
          region: region || undefined,
          topic: topic || undefined,
          studyStyle: studyStyle || undefined,
          recruiting: recruiting || undefined
        });
        setSearchResults(response.data);
      } catch (err) {
        console.error("검색 결과 로딩 실패:", err);
        setError('검색 결과를 불러오는 데 실패했습니다.');
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, setSearchTerm, region, topic, studyStyle, recruiting]); // 필터 변경 시 재실행

  if (loading) return <div className="loading">검색 결과 로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="search-result-container">
      <h1 className="search-result-title">{query ? `'${query}' 검색 결과` : '전체 스터디 목록'}</h1>
      
      {/* 필터 섹션 (Filter Section) */}
      <div className="filter-section">
        <select value={region} onChange={(e) => setRegion(e.target.value)} className="filter-select">
          <option value="">전체 지역</option>
          <option value="서울">서울</option>
          <option value="부산">부산</option>
          <option value="대구">대구</option>
          <option value="인천">인천</option>
          <option value="광주">광주</option>
          <option value="대전">대전</option>
          <option value="울산">울산</option>
          <option value="세종">세종</option>
          <option value="경기">경기</option>
          <option value="강원">강원</option>
        </select>

        <input 
          type="text" 
          placeholder="분야 (예: 백엔드)" 
          value={topic} 
          onChange={(e) => setTopic(e.target.value)} 
          className="filter-input"
        />

        <select value={studyStyle} onChange={(e) => setStudyStyle(e.target.value)} className="filter-select">
          <option value="">온/오프라인 전체</option>
          <option value="ONLINE">온라인</option>
          <option value="OFFLINE">오프라인</option>
          <option value="HYBRID">온/오프라인 혼합</option>
        </select>

        <label className="filter-checkbox-label">
          <input 
            type="checkbox" 
            checked={recruiting} 
            onChange={(e) => setRecruiting(e.target.checked)} 
            className="filter-checkbox"
          />
          모집 중만 보기
        </label>
      </div>

      {searchResults.length > 0 ? (
        <div className="search-result-grid">
          {searchResults.map(group => (
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
          ))}
        </div>
      ) : (
        <p className="no-results-message">{query ? `'${query}'에 대한 검색 결과가 없습니다.` : '등록된 스터디가 없습니다.'}</p>
      )}
    </div>
  );
}

export default SearchResultPage;