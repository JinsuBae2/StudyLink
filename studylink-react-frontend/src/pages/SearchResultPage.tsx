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

  useEffect(() => {
    // SearchContext의 searchTerm도 동기화
    setSearchTerm(query);

    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        // 검색어가 없으면 전체 목록 조회, 있으면 검색어로 조회
        const response = await getStudyGroups({ search: query });
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
  }, [query, setSearchTerm]); // query가 변경될 때마다 재실행

  if (loading) return <div className="loading">검색 결과 로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="search-result-container">
      <h1 className="search-result-title">{query ? `'${query}' 검색 결과` : '전체 스터디 목록'}</h1>
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