import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getApplicationsForStudy, processApplication, type Application } from '../api/apiService'; // 새로운 API 함수와 타입

function StudyManagePage() {
  const { id } = useParams<{ id: string }>();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      if (!id) return;
      try {
        const response = await getApplicationsForStudy(Number(id));
        setApplications(response.data);
      } catch (err) {
        setError('신청 목록을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [id]);

  const handleProcess = async (applicationId: number, status: 'ACCEPTED' | 'REJECTED') => {
    if (!id) return;
    try {
      await processApplication(Number(id), applicationId, { status });
      alert(`신청이 ${status === 'ACCEPTED' ? '수락' : '거절'}되었습니다.`);
      // 상태 변경 후 목록 새로고침
      const response = await getApplicationsForStudy(Number(id));
      setApplications(response.data);
    } catch (err: any) {
      alert(err.response?.data?.message || '처리 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>스터디 신청 관리</h1>
      {applications.length > 0 ? (
        applications.map(app => (
          <div key={app.applicationId} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px', borderRadius: '8px' }}>
            <p><strong>신청자:</strong> {app.applicantNickname}</p>
            <p><strong>메시지:</strong> {app.message}</p>
            <p><strong>상태:</strong> {app.status}</p>
            {app.status === 'PENDING' && (
              <div>
                <button onClick={() => handleProcess(app.applicationId, 'ACCEPTED')} style={{ marginRight: '10px' }}>수락</button>
                <button onClick={() => handleProcess(app.applicationId, 'REJECTED')}>거절</button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>들어온 신청이 없습니다.</p>
      )}
      <Link to={`/study/${id}`}>스터디 상세 페이지로 돌아가기</Link>
    </div>
  );
}

export default StudyManagePage;