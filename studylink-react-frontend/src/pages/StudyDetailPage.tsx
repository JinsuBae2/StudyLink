import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getStudyGroupDetail, 
  applyToStudyGroup, 
  getComments, 
  createComment, 
  deleteComment,
  type StudyGroupDetailResponse, 
  type ApplicationData,
  type CommentResponse
} from '../api/apiService';
import { useAuth } from '../contexts/AuthContext';
import './StudyDetailPage.css'; 
import { AxiosError } from 'axios';

function StudyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, getUserId } = useAuth();
  
  const [studyGroup, setStudyGroup] = useState<StudyGroupDetailResponse | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newComment, setNewComment] = useState(''); // 메인 댓글 입력
  
  // 👇 [추가] 답글 관련 상태
  const [replyingTo, setReplyingTo] = useState<number | null>(null); // 현재 답글을 달고 있는 댓글 ID
  const [replyContent, setReplyContent] = useState(''); // 답글 내용
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applicationMessage, setApplicationMessage] = useState('');

  const currentUserId = getUserId();
  const isGroupCreator = studyGroup?.creatorId === currentUserId;

  const fetchData = async () => {
    if (!id) return;
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

  useEffect(() => {
    fetchData();
  }, [id]);

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

  // 메인 댓글 작성
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

  // 👇 [추가] 답글 작성 핸들러
  const handleReplySubmit = async (parentId: number) => {
    if (!id || !replyContent.trim()) return;

    try {
      await createComment(Number(id), { content: replyContent, parentId }); // parentId 포함 전송
      setReplyContent('');
      setReplyingTo(null); // 답글 입력창 닫기
      
      const commentsRes = await getComments(Number(id));
      setComments(commentsRes.data);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || '답글 작성에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("댓글을 삭제하시겠습니까? (답글이 있는 경우 함께 삭제됩니다)")) return;

    try {
      await deleteComment(commentId);
      const commentsRes = await getComments(Number(id));
      setComments(commentsRes.data);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || '댓글 삭제에 실패했습니다.');
    }
  };

  // 👇 [추가] 댓글 렌더링 헬퍼 함수 (재귀적으로 렌더링 가능하지만, 여기선 1뎁스 대댓글만 보여줌)
  const renderCommentItem = (comment: CommentResponse, isReply = false) => (
    <div key={comment.id} className={`comment-item ${isReply ? 'reply-item' : ''}`}>
      <div className="comment-header">
        <span className="comment-author">{comment.authorNickname}</span>
        <div className="comment-meta">
          <span className="comment-date">{new Date(comment.createdAt).toLocaleString()}</span>
          {/* 답글 달기 버튼 (로그인 필요, 대댓글에는 답글 불가 정책이라면 isReply 체크) */}
          {!isReply && isAuthenticated && (
            <button 
              onClick={() => {
                setReplyingTo(replyingTo === comment.id ? null : comment.id);
                setReplyContent('');
              }} 
              className="comment-reply-btn"
            >
              답글
            </button>
          )}
          {/* 삭제 버튼 */}
          {isAuthenticated && currentUserId === comment.authorId && (
            <button onClick={() => handleDeleteComment(comment.id)} className="comment-delete-btn">
              삭제
            </button>
          )}
        </div>
      </div>
      <p className="comment-content">{comment.content}</p>

      {/* 답글 입력 폼 (해당 댓글에 답글 달기를 눌렀을 때만 표시) */}
      {replyingTo === comment.id && (
        <div className="reply-form">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="답글을 입력하세요..."
            rows={2}
            className="reply-input"
          />
          <div className="reply-actions">
            <button onClick={() => setReplyingTo(null)} className="reply-cancel-btn">취소</button>
            <button onClick={() => handleReplySubmit(comment.id)} className="reply-submit-btn">등록</button>
          </div>
        </div>
      )}

      {/* 자식 댓글(대댓글) 렌더링 */}
      {comment.children && comment.children.length > 0 && (
        <div className="comment-children">
          {comment.children.map(child => renderCommentItem(child, true))}
        </div>
      )}
    </div>
  );

  if (loading) return <div className="study-detail-container"><div className="study-detail-box">로딩 중...</div></div>;
  if (error) return <div className="study-detail-container"><div className="study-detail-box" style={{ color: 'red' }}>{error}</div></div>;
  if (!studyGroup) return <div className="study-detail-container"><div className="study-detail-box">해당 스터디를 찾을 수 없습니다.</div></div>;

  return (
    <div className="study-detail-container">
      <div className="study-detail-box">
        <button onClick={() => navigate(`/`)} className="back-button">&lt; 목록으로</button>
        
        <h1>{studyGroup.title}</h1>
        {/* ... (중간 상세 정보 생략 - 기존 코드 유지) ... */}
        <div className="info-grid">
          <p className="info-item"><strong>주제:</strong> {studyGroup.topic}</p>
          <p className="info-item"><strong>리더:</strong> {studyGroup.creatorNickname}</p>
          <p className="info-item"><strong>지역:</strong> {studyGroup.region}</p>
          <p className="info-item"><strong>모집 마감:</strong> {studyGroup.recruitmentDeadline}</p>
          <p className="info-item"><strong>모집 인원:</strong> {studyGroup.maxMemberCount}명</p>
          <p className="info-item"><strong>생성일:</strong> {new Date(studyGroup.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="description-section">
          <h3>스터디 목표</h3>
          <p>{studyGroup.goal}</p>
        </div>

        <div className="description-section">
          <h3>상세 설명</h3>
          <p>{studyGroup.description}</p>
        </div>

        {/* 참여 신청 섹션 */}
        {!isGroupCreator && isAuthenticated && (
            <div className="application-section">
              <h3>스터디 참여 신청</h3>
              <textarea
                rows={4}
                placeholder="그룹장에게 간단한 메시지를 남겨보세요."
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                className="application-textarea"
              />
              <button onClick={handleApply} className="apply-button">신청하기</button>
            </div>
        )}
        {!isAuthenticated && (
            <div className="application-section">
                <p style={{ textAlign: 'center', color: '#666' }}>로그인 후 스터디에 참여 신청할 수 있습니다.</p>
            </div>
        )}

        {/* 댓글 섹션 */}
        <div className="comment-section">
          <h3>문의 / 댓글</h3>
          <div className="comment-list">
            {comments.length > 0 ? (
              comments.map(comment => renderCommentItem(comment))
            ) : (
              <p className="no-comments">아직 작성된 댓글이 없습니다.</p>
            )}
          </div>

          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="문의사항이나 의견을 남겨주세요."
                rows={3}
                required
                className="comment-input"
              />
              <button type="submit" className="comment-submit-btn">등록</button>
            </form>
          ) : (
            <p className="login-to-comment">댓글을 작성하려면 로그인이 필요합니다.</p>
          )}
        </div>

      </div>
    </div>
  );
}

export default StudyDetailPage;