// src/pages/StudyDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudyGroupDetail, type StudyGroupDetail } from '../api/apiService';
import './StudyDetailPage.css'; // 👈 CSS 파일 import

function StudyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [studyGroup, setStudyGroup] = useState<StudyGroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudyDetail = async () => {
      if (!id) {
        setError('잘못된 스터디 ID입니다.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await getStudyGroupDetail(Number(id));
        setStudyGroup(response.data);
      } catch (err) {
        console.error('스터디 상세 정보 로딩 실패:', err);
        setError('스터디 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudyDetail();
  }, [id]);

  if (loading) return <div className="study-detail-container"><div className="study-detail-box">로딩 중...</div></div>;
  if (error) return <div className="study-detail-container"><div className="study-detail-box" style={{ color: 'red' }}>{error}</div></div>;
  if (!studyGroup) return <div className="study-detail-container"><div className="study-detail-box">해당 스터디를 찾을 수 없습니다.</div></div>;

  return (
    <div className="study-detail-container">
      <div className="study-detail-box">
        <button onClick={() => navigate(-1)} className="back-button">&lt; 목록으로</button>
        
        <h1>{studyGroup.title}</h1>

        <div className="info-grid">
          <p className="info-item"><strong>주제:</strong> {studyGroup.topic}</p>
          <p className="info-item"><strong>리더:</strong> {studyGroup.creatorNickname}</p>
          <p className="info-item"><strong>지역:</strong> {studyGroup.region}</p>
          <p className="info-item"><strong>모집 마감:</strong> {studyGroup.recruitmemtDeadLine}</p>
          <p className="info-item"><strong>모집 인원:</strong> {studyGroup.memberCount}명</p>
          <p className="info-item"><strong>생성일:</strong> {new Date(studyGroup.createAt).toLocaleDateString()}</p>
        </div>

        <div className="description-section">
          <h3>스터디 목표</h3>
          <p>{studyGroup.goal}</p>
        </div>

        <div className="description-section">
          <h3>상세 설명</h3>
          <p>{studyGroup.description}</p>
        </div>

        {/* TODO: 여기에 '참여 신청' 버튼 추가 */}
      </div>
    </div>
  );
}

export default StudyDetailPage;