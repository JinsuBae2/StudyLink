import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, updateMyProfile, type UserProfileResponse, type UserProfileUpdateRequest } from '../api/apiService';
import { AxiosError } from 'axios';
import './ProfileEditPage.css'; // 👈 CSS 파일 import


interface ErrorResponse {
    message: string;
    // 다른 에러 관련 필드가 있다면 여기에 추가
  }

// 드롭다운 메뉴용 옵션 배열
const careerOptions = [
  { value: '', label: '선택 안 함' },
  { value: 'NEWBIE', label: '신입' },
  { value: 'JUNIOR', label: '주니어 (1~3년)' },
  { value: 'SENIOR', label: '시니어 (4년 이상)' },
];

const studyStyleOptions = [
  { value: '', label: '선택 안 함' },
  { value: 'ONLINE', label: '온라인' },
  { value: 'OFFLINE', label: '오프라인' },
  { value: 'HYBRID', label: '혼합' },
];

function ProfileEditPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserProfileUpdateRequest>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMyProfile();
        setProfile(response.data);
        // 폼 데이터 초기값 설정
        setFormData({
          nickname: response.data.nickname,
          career: undefined,
          job: undefined,
          goal: undefined,
          studyStyle: undefined,
          region: undefined,
          tags: response.data.tags,
        });
      } catch (err) {
        const axiosError = err as AxiosError<ErrorResponse>; 
        console.error('프로필 정보를 불러오는 데 실패했습니다:', axiosError);
        setError(axiosError.response?.data?.message || '프로필 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    // 쉼표로 분리하고 공백 제거 후 배열로 변환
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, tags: tagsArray }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMyProfile(formData);
      alert('프로필이 성공적으로 업데이트되었습니다!');
      navigate('/mypage'); // 수정 후 마이페이지로 이동
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>; 
      console.error('프로필 업데이트 실패:', axiosError);
      setError(axiosError.response?.data?.message || '프로필 업데이트에 실패했습니다.');
    }
  };

  if (loading) return <div className="profile-edit-loading">프로필 로딩 중...</div>;
  if (error) return <div className="profile-edit-error">오류: {error}</div>;
  if (!profile) return <div className="profile-edit-error">프로필 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="profile-edit-container">
      <h1>프로필 수정</h1>
      <form onSubmit={handleSubmit} className="profile-edit-form">
        <div className="form-group">
          <label htmlFor="nickname">닉네임</label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            value={formData.nickname || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="career">경력</label>
          <select id="career" name="career" value={formData.career || ''} onChange={handleChange}>
            {careerOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="job">직무</label>
          <input
            type="text"
            id="job"
            name="job"
            value={formData.job || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="goal">목표</label>
          <textarea
            id="goal"
            name="goal"
            value={formData.goal || ''}
            onChange={handleChange}
            rows={4}
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="studyStyle">학습 스타일</label>
          <select id="studyStyle" name="studyStyle" value={formData.studyStyle || ''} onChange={handleChange}>
            {studyStyleOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="region">활동 지역</label>
          <input
            type="text"
            id="region"
            name="region"
            value={formData.region || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">관심 태그 (쉼표로 구분)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags ? formData.tags.join(', ') : ''}
            onChange={handleTagsChange}
            placeholder="Java, Spring, React"
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="button-group">
          <button type="submit" className="submit-button">프로필 저장</button>
          <button type="button" onClick={() => navigate('/mypage')} className="cancel-button">취소</button>
        </div>
      </form>
    </div>
  );
}

export default ProfileEditPage;