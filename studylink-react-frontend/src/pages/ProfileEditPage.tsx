import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, updateMyProfile, type UserProfileResponse, type UserProfileUpdateRequest } from '../api/apiService';
import { AxiosError } from 'axios';
import './ProfileEditPage.css';

interface ErrorResponse {
    message: string;
}

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
  
  // 🌟 formData의 tags는 항상 string[]으로 관리
  const [formData, setFormData] = useState<{
    nickname?: string;
    career?: 'NEWBIE' | 'JUNIOR' | 'SENIOR' | '';
    job?: string;
    goal?: string;
    studyStyle?: 'ONLINE' | 'OFFLINE' | 'HYBRID' | '';
    region?: string;
    tags?: string[]; // 🌟 tags를 UserProfileUpdateRequest 타입에 맞춰 string[] (선택적)으로 정의
  }>({ tags: [] }); // 초기값에 tags: [] 추가하여 항상 배열임을 보장
  
  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMyProfile();
        setProfile(response.data);
        
        // 🌟 백엔드에서 받은 tags는 이미 string[]이라고 가정 (UserProfileResponse 타입에 맞춤)
        const initialTags: string[] = response.data.tags || [];

        setFormData({
          nickname: response.data.nickname || '',
          career: response.data.career || '',
          job: response.data.job || '',
          goal: response.data.goal || '',
          studyStyle: response.data.studyStyle || '',
          region: response.data.region || '',
          tags: initialTags, // 🌟 백엔드 응답 그대로 사용 (string[])
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

  const handleAddTag = () => {
    const trimmedTag = newTagInput.trim();
    // 🌟 formData.tags는 항상 배열이므로 안전하게 includes 사용
    if (trimmedTag && formData.tags && !formData.tags.includes(trimmedTag)) { 
      setFormData(prev => ({ ...prev, tags: [...prev.tags!, trimmedTag] })); // !로 non-null 단언
      setNewTagInput('');
    } else if (trimmedTag && !formData.tags) { // tags가 아직 undefined인 경우 (극히 드물겠지만)
        setFormData(prev => ({ ...prev, tags: [trimmedTag] }));
        setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    // 🌟 formData.tags는 항상 배열이므로 안전하게 filter 사용
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags ? prev.tags.filter(tag => tag !== tagToRemove) : []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 🌟 dataToSend는 formData와 동일한 string[] tags를 가짐
      const dataToSend: UserProfileUpdateRequest = { 
          nickname: formData.nickname,
          career: formData.career || undefined,
          job: formData.job,
          goal: formData.goal,
          studyStyle: formData.studyStyle || undefined,
          region: formData.region,
          tags: formData.tags // 🌟 변환 없이 그대로 string[] 전송
      };

  

      // 빈 문자열 필드 정리 (선택 사항: 백엔드가 null을 선호한다면 처리)
      if (dataToSend.career === undefined) delete dataToSend.career;
      if (dataToSend.studyStyle === undefined) delete dataToSend.studyStyle;

      await updateMyProfile(dataToSend);
      alert('프로필이 성공적으로 업데이트되었습니다!');
      navigate('/mypage');
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
          <label htmlFor="newTagInput">관심 태그</label>
          <div className="tag-input-area">
            <input
              type="text"
              id="newTagInput"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="새 태그 입력 (예: Java)"
            />
            <button type="button" onClick={handleAddTag} className="add-tag-button">
              추가
            </button>
          </div>
          <div className="tag-chips-container">
            {(formData.tags || []).map((tag, index) => ( // 🌟 formData.tags가 undefined일 경우를 대비하여 || []
              <span key={index} className="tag-chip">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} className="remove-tag-button">
                  &times;
                </button>
              </span>
            ))}
          </div>
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