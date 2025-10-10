import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStudyGroup, type StudyGroupCreateRequest } from '../api/apiService';
import { AxiosError } from 'axios';
import './CreateStudyPage.css'; // 👈 CSS 파일 import

// 드롭다운 메뉴용 옵션 배열 (예시)
const topicOptions = [
  { value: '', label: '주제 선택' },
  { value: '프로그래밍', label: '프로그래밍' },
  { value: '어학', label: '어학' },
  { value: '자격증', label: '자격증' },
  { value: '취업준비', label: '취업 준비' },
  { value: '독서', label: '독서' },
  { value: '기타', label: '기타' },
];

const studyStyleOptions = [
    { value: '', label: '학습 스타일 선택' },
    { value: 'ONLINE', label: '온라인' },
    { value: 'OFFLINE', label: '오프라인' },
    { value: 'HYBRID', label: '온/오프라인 혼합' },
  ];

function CreateStudyPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StudyGroupCreateRequest>({
    title: '',
    topic: '',
    description: '',
    goal: '',
    memberCount: 2, // 기본 최소 2명
    studyStyle: '', // 👈 [추가] 초기값 설정
    recruitmentDeadline: '',
    region: '',
    tags: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // 숫자로 변환 가능한 경우에만 업데이트
    if (!isNaN(Number(value)) && Number(value) >= 1) { // 최소 1명 이상
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, tags: tagsArray }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 유효성 검사 (간단하게)
    if (formData.title.length < 5) {
        setError('스터디 제목은 5자 이상이어야 합니다.');
        setLoading(false);
        return;
    }
    if (formData.memberCount < 2 || formData.memberCount > 10) { // 예시: 2명 ~ 10명 제한
        setError('스터디 인원은 2명에서 10명 사이여야 합니다.');
        setLoading(false);
        return;
    }
    if (!formData.recruitmentDeadline) {
        setError('모집 마감일을 입력해야 합니다.');
        setLoading(false);
        return;
    }
    if (new Date(formData.recruitmentDeadline) <= new Date()) {
        setError('모집 마감일은 오늘 날짜보다 이후여야 합니다.');
        setLoading(false);
        return;
    }

    try {
      await createStudyGroup(formData);
      alert('스터디 그룹이 성공적으로 생성되었습니다!');
      navigate('/'); // 생성 후 홈 또는 마이페이지로 이동
    } catch (err) {
      const axiosError = err as AxiosError<any>;
      console.error('스터디 그룹 생성 실패:', axiosError);
      setError(axiosError.response?.data?.message || '스터디 그룹 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-study-container">
      <h1>새 스터디 그룹 생성</h1>
      <form onSubmit={handleSubmit} className="create-study-form">
        <div className="form-group">
          <label htmlFor="title">제목</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="topic">주제</label>
          <select id="topic" name="topic" value={formData.topic} onChange={handleChange} required>
            {topicOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">설명</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="goal">목표</label>
          <textarea
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            rows={3}
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="memberCount">최대 인원</label>
          <input
            type="number"
            id="memberCount"
            name="memberCount"
            value={formData.memberCount}
            onChange={handleNumberChange}
            min="2" // 최소 2명
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="studyStyle">학습 스타일</label>
          <select id="studyStyle" name="studyStyle" value={formData.studyStyle} onChange={handleChange} required>
            {studyStyleOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="recruitmentDeadline">모집 마감일</label>
          <input
            type="date"
            id="recruitmentDeadline"
            name="recruitmentDeadline"
            value={formData.recruitmentDeadline}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="region">활동 지역</label>
          <input
            type="text"
            id="region"
            name="region"
            value={formData.region}
            onChange={handleChange}
            placeholder="예: 서울, 강남구"
            required
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
            placeholder="#Java, #Spring, #React"
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="button-group">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? '생성 중...' : '스터디 생성'}
          </button>
          <button type="button" onClick={() => navigate('/')} className="cancel-button" disabled={loading}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateStudyPage;