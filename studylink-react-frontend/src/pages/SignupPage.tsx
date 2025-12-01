import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup, type SignupData } from '../api/apiService';
import './SignupPage.css';
import type { AxiosError } from 'axios';

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignupData>({
    email: '', password: '', nickname: '', birthDate: '',
    career: undefined, job: '', goal: '', studyStyle: undefined,
    region: '', tags: [],
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsInput = e.target.value;
    setFormData(prev => ({ ...prev, tags: tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await signup(formData);
      navigate('/login');
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card signup-card">
        <div className="auth-header">
          <h1 className="auth-title">계정 만들기</h1>
          <p className="auth-subtitle">StudyLink와 함께 성장하는 여정을 시작하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">이메일</label>
              <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required className="form-input" placeholder="name@example.com" />
            </div>
            <div className="form-group">
              <label htmlFor="nickname">닉네임</label>
              <input id="nickname" type="text" name="nickname" value={formData.nickname} onChange={handleChange} required className="form-input" placeholder="사용할 닉네임" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} required className="form-input" placeholder="최소 8자 이상" />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">비밀번호 확인</label>
              <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="form-input" placeholder="비밀번호 재입력" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="birthDate">생년월일</label>
            <input id="birthDate" type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required className="form-input" />
          </div>

          <div className="form-divider"><span>추가 정보 (선택)</span></div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="career">경력</label>
              <select id="career" name="career" value={formData.career || ''} onChange={handleChange} className="form-input">
                <option value="">선택하세요</option>
                <option value="NEWBIE">신입 (Newbie)</option>
                <option value="JUNIOR">주니어 (Junior)</option>
                <option value="SENIOR">시니어 (Senior)</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="studyStyle">선호 학습 스타일</label>
              <select id="studyStyle" name="studyStyle" value={formData.studyStyle || ''} onChange={handleChange} className="form-input">
                <option value="">선택하세요</option>
                <option value="ONLINE">온라인</option>
                <option value="OFFLINE">오프라인</option>
                <option value="HYBRID">온/오프라인 혼합</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="goal">학습 목표</label>
            <textarea id="goal" name="goal" value={formData.goal} onChange={handleChange} rows={2} className="form-input" placeholder="이루고 싶은 목표를 적어주세요"></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="tags">관심 태그 (쉼표로 구분)</label>
            <input id="tags" type="text" name="tags" value={formData.tags?.join(', ') || ''} onChange={handleTagChange} className="form-input" placeholder="예: React, Python, 영어회화" />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
            {isLoading ? '가입 처리 중...' : '회원가입'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            이미 계정이 있으신가요? <Link to="/login" className="auth-link">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;