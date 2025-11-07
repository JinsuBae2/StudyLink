import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getStudyGroupDetail,
  updateStudyGroup,
  type StudyGroupDetailResponse,
  type StudyGroupUpdateRequest,
} from '../api/apiService';
import { AxiosError } from 'axios';
import './StudyEditPage.css';


// 드롭다운 메뉴용 옵션 배열 (CreateStudyPage와 동일하게 사용)
const topicOptions = [
  { value: '프로그래밍', label: '프로그래밍' },
  { value: '어학', label: '어학' },
  { value: '자격증', label: '자격증' },
  { value: '취업준비', label: '취업 준비' },
  { value: '독서', label: '독서' },
  { value: '기타', label: '기타' },
];

const studyStyleOptions = [
  { value: 'ONLINE', label: '온라인' },
  { value: 'OFFLINE', label: '오프라인' },
  { value: 'HYBRID', label: '온/오프라인 혼합' },
];

function StudyEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [studyGroup, setStudyGroup] = useState<StudyGroupDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<StudyGroupUpdateRequest>({
    title: '',
    topic: '',
    description: '',
    goal:'',
    memberCount: 2,
    studyStyle: 'ONLINE',
    region: '',
    tags: [],
    recruitmentDeadline: '',
  });

  useEffect(() => {
    const fetchStudyGroup = async () => {
      if (!id) {
        setError('스터디 ID가 없습니다.');
        setLoading(false);
        return;
      }
      try {
        const response = await getStudyGroupDetail(Number(id));
        setStudyGroup(response.data);
        // 기존 데이터를 폼 데이터로 초기화
        setFormData({
          title: response.data.title,
          topic: response.data.topic,
          description: response.data.description,
          goal: response.data.goal,
          memberCount: response.data.maxMemberCount,
          studyStyle: response.data.studyStyle,
          region: response.data.region,
          tags: response.data.tags,
          recruitmentDeadline: response.data.recruitmentDeadline, // "YYYY-MM-DD" 형식이라고 가정
        });
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        console.error('스터디 정보 로딩 실패:', axiosError);
        setError(axiosError.response?.data?.message || '스터디 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudyGroup();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
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
    if (!id) return;
    setLoading(true); // 버튼 로딩 상태 관리
    setError(null);

    // 간단한 유효성 검사 (CreateStudyPage와 유사하게 추가)
    if (formData.title && formData.title.length < 5) {
        setError('스터디 제목은 5자 이상이어야 합니다.');
        setLoading(false);
        return;
    }
    if (formData.memberCount && (formData.memberCount < (studyGroup?.currentMemberCount || 2) || formData.memberCount > 10)) { 
        // 현재 참여자 수보다 적게 설정 불가, 예시: 최대 10명
        setError(`스터디 인원은 현재 참여자 수(${studyGroup?.currentMemberCount || 0}명) 이상 10명 이하여야 합니다.`);
        setLoading(false);
        return;
    }
    if (formData.recruitmentDeadline && new Date(formData.recruitmentDeadline) <= new Date()) {
        setError('모집 마감일은 오늘 날짜보다 이후여야 합니다.');
        setLoading(false);
        return;
    }

    try {
      const requestData: StudyGroupUpdateRequest = {
        title: formData.title,
        topic: formData.topic,
        description: formData.description,
        goal: formData.goal,
        memberCount: formData.memberCount, // DTO 필드명과 일치
        studyStyle: formData.studyStyle,
        region: formData.region,        
        tags: formData.tags || [], // 태그가 없을 경우 빈 배열
        recruitmentDeadline: formData.recruitmentDeadline,
      };
      await updateStudyGroup(Number(id), requestData);
      alert('스터디 그룹 정보가 성공적으로 업데이트되었습니다!');
      navigate(`/study/${id}`); // 수정 후 상세 페이지로 이동
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      console.error('스터디 그룹 업데이트 실패:', axiosError);
      setError(axiosError.response?.data?.message || '스터디 그룹 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!studyGroup) return <div className="no-data">스터디 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="study-edit-container">
      <h1>스터디 그룹 수정: {studyGroup.title}</h1>
      <form onSubmit={handleSubmit} className="study-edit-form">
        <div className="form-group">
          <label htmlFor="title">제목</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="topic">주제</label>
          <select id="topic" name="topic" value={formData.topic || ''} onChange={handleChange} required>
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
            value={formData.description || ''}
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
            value={formData.goal || ''}
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
            value={formData.memberCount || ''}
            onChange={handleNumberChange}
            min={studyGroup.currentMemberCount ?? 2} // 현재 참여자 수보다 적게 설정 불가
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="studyStyle">학습 스타일</label>
          <select id="studyStyle" name="studyStyle" value={formData.studyStyle || ''} onChange={handleChange} required>
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
            value={formData.recruitmentDeadline || ''}
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
            value={formData.region || ''}
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
            {loading ? '저장 중...' : '변경 사항 저장'}
          </button>
          <button type="button" onClick={() => navigate(`/study/${id}`)} className="cancel-button" disabled={loading}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default StudyEditPage;