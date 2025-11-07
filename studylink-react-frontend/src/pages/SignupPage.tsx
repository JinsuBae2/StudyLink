// src/pages/SignupPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup, type SignupData } from '../api/apiService';
import './SignupPage.css'; // 👈 CSS 파일 import
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
  const [successMessage, setSuccessMessage] = useState('');

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
    // 비밀번호 확인 로직
    if (formData.password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setError(''); // 에러 초기화

    try {
      await signup(formData);
      setSuccessMessage('회원가입이 성공적으로 완료되었습니다! 로그인 페이지로 이동합니다.');
      setTimeout(() => {
        navigate('/login'); // 회원가입 성공 시 로그인 페이지로 이동
      }, 3000);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || '회원가입에 실패했습니다.');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>회원가입</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">이메일</label>
            <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label htmlFor="password">비밀번호</label>
            <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <div className="input-group">
            <label htmlFor="nickname">닉네임</label>
            <input id="nickname" type="text" name="nickname" value={formData.nickname} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label htmlFor="birthDate">생년월일 (YYYY-MM-DD)</label>
            <input id="birthDate" type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label htmlFor="career">경력</label>
            <select id="career" name="career" value={formData.career || ''} onChange={handleChange}>
              <option value="">선택하세요</option>
              <option value="NEWBIE">NEWBIE</option>
              <option value="JUNIOR">JUNIOR</option>
              <option value="SENIOR">SENIOR</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="job">직업</label>
            <input id="job" type="text" name="job" value={formData.job} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label htmlFor="goal">학습 목표</label>
            <textarea id="goal" name="goal" value={formData.goal} onChange={handleChange} rows={3}></textarea>
          </div>

          <div className="input-group">
            <label htmlFor="studyStyle">선호 학습 스타일</label>
            <select id="studyStyle" name="studyStyle" value={formData.studyStyle || ''} onChange={handleChange}>
              <option value="">선택하세요</option>
              <option value="ONLINE">ONLINE</option>
              <option value="OFFLINE">OFFLINE</option>
              <option value="HYBRID">HYBRID</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="region">지역</label>
            <input id="region" type="text" name="region" value={formData.region} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label htmlFor="tags">관심 태그 (쉼표로 구분)</label>
            <input id="tags" type="text" name="tags" value={formData.tags?.join(', ') || ''} onChange={handleTagChange} />
          </div>

          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}

          <button type="submit" className="signup-button">
            회원가입
          </button>
        </form>
        <p className="login-redirect-link">
          이미 회원이신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;