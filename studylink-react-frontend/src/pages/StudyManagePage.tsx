import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getApplicationsForStudy,
  processApplication,
  deleteStudyGroup, 
  getStudyGroupDetail, 
  type StudyGroupDetailResponse,
  type ApplicationResponse,
} from '../api/apiService';
import type { AxiosError } from 'axios';
import './StudyManagePage.css';

function StudyManagePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [studyGroup, setStudyGroup] = useState<StudyGroupDetailResponse | null>(null); // 👈 스터디 정보 상태 추가
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudyData = async () => {
      if (!id) return;
      try {
        // 스터디 상세 정보와 신청 목록을 동시에 불러옴
        const [studyRes, appRes] = await Promise.all([
          getStudyGroupDetail(Number(id)), // 👈 스터디 상세 정보 호출
          getApplicationsForStudy(Number(id)),
        ]);
        setStudyGroup(studyRes.data); // 👈 스터디 정보 저장
        setApplications(appRes.data);
      } catch (err) {
        const axiosError = err as AxiosError<{message?: string}>;
        setError(axiosError.response?.data?.message || '정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudyData();
  }, [id]);

  const handleProcess = async (applicationId: number, status: 'ACCEPTED' | 'REJECTED') => {
    if (!id) return;
    try {
      await processApplication(Number(id), applicationId, { status });
      alert(`신청이 ${status === 'ACCEPTED' ? '수락' : '거절'}되었습니다.`);
      // 상태 변경 후 목록 새로고침
      const response = await getApplicationsForStudy(Number(id));
      setApplications(response.data);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || '처리 중 오류가 발생했습니다.');
    }
  };

  // 👇 [추가] 스터디 삭제 핸들러
  const handleDeleteStudy = async () => {
    if (!id) return;
    if (window.confirm('정말로 이 스터디 그룹을 삭제하시겠습니까? 모든 데이터가 사라집니다.')) {
      try {
        await deleteStudyGroup(Number(id));
        alert('스터디 그룹이 성공적으로 삭제되었습니다.');
        navigate('/mypage'); // 삭제 후 마이페이지 또는 홈으로 이동
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        alert(axiosError.response?.data?.message || '스터디 그룹 삭제에 실패했습니다.');
      }
    }
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">오류: {error}</div>;
  if (!studyGroup) return <div className="no-data">스터디 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="study-manage-container">
      <h1>{studyGroup.title} 스터디 관리</h1>

      <div className="manage-buttons">
        <Link to={`/study/${id}/edit`} className="edit-study-button">
          스터디 정보 수정
        </Link>
        <button onClick={handleDeleteStudy} className="delete-study-button">
          스터디 삭제
        </button>
      </div>

      <section className="applications-section">
        <h2>신청자 목록</h2>
        {applications.length > 0 ? (
          applications.map(app => (
            <div key={app.applicationId} className="application-card">
              <p><strong>신청자:</strong> {app.applicationId}</p>
              <p><strong>메시지:</strong> {app.message}</p>
              <p><strong>상태:</strong> <span className={`status-${app.status.toLowerCase()}`}>{app.status}</span></p>
              {app.status === 'PENDING' && (
                <div className="application-actions">
                  <button onClick={() => handleProcess(app.applicationId, 'ACCEPTED')} className="accept-button">수락</button>
                  <button onClick={() => handleProcess(app.applicationId, 'REJECTED')} className="reject-button">거절</button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>들어온 신청이 없습니다.</p>
        )}
      </section>

      <div className="bottom-actions">
        <Link to={`/study/${id}`} className="back-to-detail-button">스터디 상세 페이지로 돌아가기</Link>
      </div>
    </div>
  );
}

export default StudyManagePage;