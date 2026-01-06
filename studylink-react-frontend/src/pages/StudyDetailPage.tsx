import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getStudyGroupDetail, 
  applyToStudyGroup, 
  getComments, 
  createComment, 
  deleteComment,
  toggleInterest,
  type StudyGroupDetailResponse, 
  type ApplicationData,
  type CommentResponse
} from '../api/apiService';
import { useAuth } from '../contexts/AuthContext';
import './StudyDetailPage.css'; 
import { AxiosError } from 'axios';

// 🎨 랜덤 아바타 색상 생성 함수
const getAvatarColor = (name: string) => {
  const colors = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#FF9800', '#FF5722'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

function StudyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, getUserId } = useAuth();
  
  const [studyGroup, setStudyGroup] = useState<StudyGroupDetailResponse | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applicationMessage, setApplicationMessage] = useState('');

  const currentUserId = getUserId();
  const isGroupCreator = studyGroup?.creatorId === currentUserId;

  const [isInterested, setIsInterested] = useState(false);

  // 데이터 로딩
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('잘못된 스터디 ID입니다.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [studyRes, commentsRes] = await Promise.all([
          getStudyGroupDetail(Number(id)),
          getComments(Number(id))
        ]);
        setStudyGroup(studyRes.data);
        setComments(commentsRes.data);
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        console.error('데이터 로딩 실패:', axiosError);
        setError(axiosError.response?.data?.message || '스터디 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 핸들러 함수들은 기존과 동일하게 유지
  const handleApply = async () => {
    if (!id) return;
    try {
      const data: ApplicationData = { message: applicationMessage };
      await applyToStudyGroup(Number(id), data);
      alert('스터디 참여 신청이 완료되었습니다!');
      setApplicationMessage('');
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      console.error("참여 신청 실패:", err);
      alert(axiosError.response?.data?.message || '참여 신청에 실패했습니다.');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim()) return;
    try {
      await createComment(Number(id), { content: newComment });
      setNewComment('');
      const commentsRes = await getComments(Number(id));
      setComments(commentsRes.data);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || '댓글 작성에 실패했습니다.');
    }
  };

  const handleReplySubmit = async (parentId: number) => {
    if (!id || !replyContent.trim()) return;
    try {
      await createComment(Number(id), { content: replyContent, parentId });
      setReplyContent('');
      setReplyingTo(null);
      const commentsRes = await getComments(Number(id));
      setComments(commentsRes.data);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || '답글 작성에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await deleteComment(commentId);
      const commentsRes = await getComments(Number(id));
      setComments(commentsRes.data);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || '댓글 삭제에 실패했습니다.');
    }
  };

  // 찜하기 핸들러
  const handleInterestToggle = async () => {
    if (!isAuthenticated) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!id) return;

    try {
      const response = await toggleInterest(Number(id));
      const liked = response.data.isInterested;
      setIsInterested(liked); // 백엔드 응답에 따라 상태 변경
      if (liked) alert("관심 스터디에 등록되었습니다!");
      else alert("관심 스터디에서 해제되었습니다.");
    } catch (err) {
      console.error("찜하기 실패", err);
      alert("오류가 발생했습니다.");
    }
  };

  // 댓글 렌더링 헬퍼
  const renderCommentItem = (comment: CommentResponse, isReply = false) => {
    const avatarColor = getAvatarColor(comment.authorNickname);
    const initial = comment.authorNickname.charAt(0).toUpperCase();

    return (
      <div key={comment.id} className={`comment-item-wrapper ${isReply ? 'is-reply' : ''}`}>
        <div className="comment-item">
          <div className="comment-avatar" style={{ backgroundColor: avatarColor }}>{initial}</div>
          <div className="comment-body">
            <div className="comment-header">
              <span className="comment-author">
                {comment.authorNickname}
                {studyGroup?.creatorNickname === comment.authorNickname && <span className="creator-badge">그룹장</span>}
              </span>
              <div className="comment-meta">
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
                {isAuthenticated && currentUserId === comment.authorId && (
                  <button onClick={() => handleDeleteComment(comment.id)} className="action-btn delete-btn">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                )}
              </div>
            </div>
            <p className="comment-content">{comment.content}</p>
            <div className="comment-actions">
              {!isReply && isAuthenticated && (
                <button 
                  onClick={() => { setReplyingTo(replyingTo === comment.id ? null : comment.id); setReplyContent(''); }} 
                  className={`action-btn reply-btn ${replyingTo === comment.id ? 'active' : ''}`}
                >
                  <i className="fas fa-reply"></i> 답글
                </button>
              )}
            </div>
            {replyingTo === comment.id && (
              <div className="reply-input-area">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`@${comment.authorNickname}님에게 답글...`}
                  rows={2}
                  className="modern-textarea"
                  autoFocus
                />
                <div className="form-actions">
                  <button onClick={() => setReplyingTo(null)} className="btn-text">취소</button>
                  <button onClick={() => handleReplySubmit(comment.id)} className="btn-primary small">등록</button>
                </div>
              </div>
            )}
          </div>
        </div>
        {comment.children && comment.children.length > 0 && (
          <div className="comment-children">
            {comment.children.map(child => renderCommentItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="loading-spinner">로딩 중...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!studyGroup) return <div className="error-message">스터디 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="study-detail-wrapper">
      {/* 1. 상단 헤더 (제목, 태그) */}
      <div className="study-detail-header-section">
        <div className="study-detail-header-content">
          <button onClick={() => navigate(-1)} className="back-link">
            <i className="fas fa-arrow-left"></i> 목록으로
          </button>
          <div className="title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>{studyGroup.title}</h1>
          {isAuthenticated && (
            <button 
              onClick={handleInterestToggle} 
              className={`interest-btn ${isInterested ? 'active' : ''}`}
              style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: isInterested ? '#ff4757' : '#ccc' }}
            >
              <i className={isInterested ? "fas fa-heart" : "far fa-heart"}></i>
            </button>
          )}
        </div>

          <div className="study-tags">
             <span className={`study-status-badge ${new Date(studyGroup.recruitmentDeadline) > new Date() ? 'recruiting' : 'closed'}`}>
                {new Date(studyGroup.recruitmentDeadline) > new Date() ? '모집중' : '마감됨'}
             </span>
            <span className="study-topic-badge">{studyGroup.topic}</span>
            {studyGroup.tags && studyGroup.tags.map((tag, index) => (
              <span key={index} className="study-tag">#{tag}</span>
            ))}
          </div>
          <div className="study-meta-row">
            <span className="meta-item"><i className="fas fa-user-circle"></i> {studyGroup.creatorNickname}</span>
            <span className="meta-divider">|</span>
            <span className="meta-item"><i className="far fa-calendar-alt"></i> {new Date(studyGroup.createdAt).toLocaleDateString()} 개설</span>
          </div>
        </div>
      </div>

      <div className="study-detail-body">
        {/* 2. 메인 콘텐츠 (왼쪽) */}
        <div className="detail-main">
          <section className="content-section">
            <h2>스터디 목표</h2>
            <p className="content-text">{studyGroup.goal}</p>
          </section>

          <section className="content-section">
            <h2>상세 설명</h2>
            <p className="content-text multiline">{studyGroup.description}</p>
          </section>

          {/* 댓글 섹션 */}
          <section className="comment-section">
            <h3 className="section-header">문의 / 댓글 <span className="comment-count">{comments.length}</span></h3>
            {isAuthenticated ? (
              <form onSubmit={handleCommentSubmit} className="main-comment-form">
                <div className="input-wrapper">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="스터디에 대해 궁금한 점을 남겨보세요."
                    rows={3}
                    className="modern-textarea"
                  />
                  <button type="submit" className="btn-primary send-btn"><i className="fas fa-paper-plane"></i></button>
                </div>
              </form>
            ) : (
              <div className="login-placeholder"><p>댓글을 작성하려면 <Link to="/login">로그인</Link>이 필요합니다.</p></div>
            )}
            <div className="comment-list-container">
              {comments.length > 0 ? comments.map(comment => renderCommentItem(comment)) : <p className="no-comments">아직 작성된 댓글이 없습니다.</p>}
            </div>
          </section>
        </div>

        {/* 3. 사이드바 (오른쪽) */}
        <aside className="detail-sidebar">
          <div className="sidebar-card info-card">
            <h3>스터디 정보</h3>
            <ul className="info-list">
              <li>
                <i className="fas fa-user-friends"></i>
                <div className="info-text">
                  <span className="label">모집 인원</span>
                  <span className="value">{studyGroup.currentMemberCount} / {studyGroup.maxMemberCount}명</span>
                </div>
              </li>
              <li>
                <i className="fas fa-map-marker-alt"></i>
                <div className="info-text">
                  <span className="label">지역</span>
                  <span className="value">{studyGroup.region || '온라인'}</span>
                </div>
              </li>
              <li>
                <i className="fas fa-laptop-code"></i>
                <div className="info-text">
                  <span className="label">진행 방식</span>
                  <span className="value">{studyGroup.studyStyle}</span>
                </div>
              </li>
              <li>
                <i className="far fa-clock"></i>
                <div className="info-text">
                  <span className="label">모집 마감</span>
                  <span className="value">{studyGroup.recruitmentDeadline}</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="sidebar-card action-card">
            {isAuthenticated && isGroupCreator ? (
              <button onClick={() => navigate(`/study/${studyGroup.id}/manage`)} className="sidebar-btn manage-btn">
                <i className="fas fa-cog"></i> 스터디 관리
              </button>
            ) : isAuthenticated ? (
              <div className="apply-box">
                <h3>참여 신청</h3>
                <textarea
                  rows={3}
                  placeholder="간단한 소개와 각오를 적어주세요."
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  className="sidebar-textarea"
                />
                <button onClick={handleApply} className="sidebar-btn apply-btn">신청하기</button>
              </div>
            ) : (
               <Link to="/login" className="sidebar-btn login-btn">로그인 후 신청하기</Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default StudyDetailPage;