// src/pages/StudyDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getStudyGroupDetail, type StudyGroupDetail, applyToStudyGroup, type ApplicationData } from '../api/apiService';
import { useAuth } from '../contexts/AuthContext';
import './StudyDetailPage.css'; // 👈 CSS 파일 import

function StudyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, getUserId } = useAuth();
  const [studyGroup, setStudyGroup] = useState<StudyGroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applicationMessage, setApplicationMessage] = useState('');

  const currentUserId = getUserId(); // 👈 현재 로그인한 사용자의 ID
  const isGroupCreator = studyGroup?.creatorId === currentUserId; // 👈 그룹장 여부 확인


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

  const handleApply = async () => {
    if (!id) return;
    try {
      const data: ApplicationData = { message: applicationMessage };
      await applyToStudyGroup(Number(id), data);
      alert('스터디 참여 신청이 완료되었습니다!');
      // TODO: 신청 완료 후 버튼 상태를 변경하거나 다른 UI 피드백 제공
    } catch (err: any) {
      console.error("참여 신청 실패:", err);
      alert(err.response?.data?.message || '참여 신청에 실패했습니다.');
    }
  };

  if (loading) return <div className="study-detail-container"><div className="study-detail-box">로딩 중...</div></div>;
  if (error) return <div className="study-detail-container"><div className="study-detail-box" style={{ color: 'red' }}>{error}</div></div>;
  if (!studyGroup) return <div className="study-detail-container"><div className="study-detail-box">해당 스터디를 찾을 수 없습니다.</div></div>;



  return (
    <div className="study-detail-container">
      <div className="study-detail-box">
        <button onClick={() => navigate(`/`)} className="back-button">&lt; 목록으로</button>
        
        <h1>{studyGroup.title}</h1>

        {isAuthenticated && isGroupCreator && (
          <button 
            onClick={() => navigate(`/study/${studyGroup.id}/manage`)} 
            className="manage-button"
            style={{ marginLeft: '10px', padding: '8px 15px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            스터디 관리
          </button>
        )}

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
        {!isGroupCreator && isAuthenticated && (
            <div className="application-section">
              <h3>스터디 참여 신청</h3>
              <textarea
                rows={4}
                placeholder="그룹장에게 간단한 메시지를 남겨보세요."
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                style={{ width: '100%', padding: '10px', boxSizing: 'border-box', marginBottom: '10px' }}
              />
              <button onClick={handleApply} className="apply-button">
                신청하기
              </button>
            </div>
        )}
        {!isAuthenticated && (
            <div className="application-section">
                <p style={{ textAlign: 'center', color: '#666' }}>
                    로그인 후 스터디에 참여 신청할 수 있습니다. <Link to="/login">로그인하기</Link>
                </p>
            </div>
        )}
      </div>
    </div>
  );
}

export default StudyDetailPage;