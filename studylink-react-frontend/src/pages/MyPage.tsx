import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getMyProfile,
  getMyParticipatingStudyGroups,
  getMyCreatedStudyGroups,
  getMyApplications,
  type UserProfile,
  type MyStudyGroup,
  type MyApplication,
} from '../api/apiService';
import './MyPage.css';

function MyPage() {
    const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [participatingGroups, setParticipatingGroups] = useState<MyStudyGroup[]>([]);
  const [createdGroups, setCreatedGroups] = useState<MyStudyGroup[]>([]);
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyPageData = async () => {
      try {
        setLoading(true);
        const [profileRes, partGroupsRes, createdGroupsRes, applicationsRes] = await Promise.all([
          getMyProfile(),
          getMyParticipatingStudyGroups(),
          getMyCreatedStudyGroups(),
          getMyApplications(),
        ]);
        setProfile(profileRes.data);
        setParticipatingGroups(partGroupsRes.data);
        setCreatedGroups(createdGroupsRes.data);
        setApplications(applicationsRes.data);
      } catch (err) {
        console.error('마이페이지 데이터 로딩 실패:', err);
        setError('데이터를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyPageData();
  }, []);

  if (loading) return <div className="mypage-container"><div className="mypage-box">로딩 중...</div></div>;
  if (error) return <div className="mypage-container"><div className="mypage-box" style={{ color: 'red' }}>{error}</div></div>;
  if (!profile) return <div className="mypage-container"><div className="mypage-box">사용자 정보를 찾을 수 없습니다.</div></div>;

  return (
    <div className="mypage-container">
      <div className="mypage-box">
        <h1>마이페이지</h1>

        {/* 프로필 정보 */}
        <section className="mypage-section profile-section">
          <h2>내 프로필</h2>
          <div className="profile-info-grid">
            <p><strong>닉네임:</strong> {profile.nickname}</p>
            <p><strong>이메일:</strong> {profile.email}</p>
            <p><strong>생년월일:</strong> {profile.birthDate}</p>
            <p><strong>경력:</strong> {profile.career}</p>
            <p><strong>직업:</strong> {profile.job}</p>
            <p><strong>학습 목표:</strong> {profile.goal}</p>
            <p><strong>학습 스타일:</strong> {profile.studyStyle}</p>
            <p><strong>지역:</strong> {profile.region}</p>
            <p><strong>관심 태그:</strong> {profile.tags.join(', ')}</p>
            <p><strong>가입일:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
          </div>
          <Link to="/profile/edit" className="edit-profile-button">프로필 수정</Link>
        </section>

        {/* 내가 생성한 스터디 */}
        <section className="mypage-section">
          <h2>내가 생성한 스터디</h2>
          {createdGroups.length > 0 ? (
            <div className="study-list-grid">
              {createdGroups.map(group => (
                <div key={group.id} className="study-card">
                  <h3><Link to={`/study/${group.id}`} className="study-link">{group.title}</Link></h3>
                  <p>{group.topic}</p>
                  <p>멤버: {group.currentParticipants}/{group.maxParticipants}</p>
                  <Link to={`/study/${group.id}/manage`} className="manage-link">관리하기</Link>
                </div>
              ))}
            </div>
          ) : (
            <p>생성한 스터디가 없습니다.</p>
          )}
          <div className="mypage-actions">
            <Link to="/create-study" className="create-study-button">새 스터디 생성</Link>
          </div>
        </section>

        {/* 내가 참여 중인 스터디 */}
        <section className="mypage-section">
          <h2>내가 참여 중인 스터디</h2>
          {participatingGroups.length > 0 ? (
            <div className="study-list-grid">
              {participatingGroups.map(group => (
                <div key={group.id} className="study-card">
                  <h3><Link to={`/study/${group.id}`} className="study-link">{group.title}</Link></h3>
                  <p>{group.topic}</p>
                  <p>멤버: {group.currentParticipants}/{group.maxParticipants}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>참여 중인 스터디가 없습니다.</p>
          )}
        </section>

        {/* 내가 신청한 스터디 */}
        <section className="mypage-section">
          <h2>내가 신청한 스터디</h2>
          {applications.length > 0 ? (
            <div className="application-list">
              {applications.map(app => (
                <div key={app.applicationId} className="application-item">
                  <p><strong>스터디:</strong> <Link to={`/study/${app.studyGroupId}`} className="study-link">{app.studyGroupTitle}</Link></p>
                  <p><strong>신청 메시지:</strong> {app.message}</p>
                  <p><strong>상태:</strong> <span className={`status-${app.status.toLowerCase()}`}>{app.status}</span></p>
                  <p><strong>신청일:</strong> {new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>신청한 스터디가 없습니다.</p>
          )}
        </section>

        <div className="mypage-bottom-actions">
            <button onClick={() => navigate('/')} className="back-to-home-button">홈으로</button>
            <button onClick={() => navigate(-1)} className="go-back-button">뒤로 가기</button>
        </div>    
      </div>
    </div>
  );
}

export default MyPage;