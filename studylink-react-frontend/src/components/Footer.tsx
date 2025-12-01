import './Footer.css';

function Footer() {
  return (
    <footer className="app-footer">
      <div className="container footer-content">
        <div className="footer-section">
          <h3 className="footer-logo">StudyLink</h3>
          <p className="footer-desc">
            관심사에 맞는 스터디 그룹을 찾아 함께 배우고 성장하세요.
          </p>
        </div>
        
        <div className="footer-links">
          <div className="link-group">
            <h4>플랫폼</h4>
            <a href="#">스터디 찾기</a>
            <a href="#">스터디 만들기</a>
            <a href="#">성공 사례</a>
          </div>
          <div className="link-group">
            <h4>고객지원</h4>
            <a href="#">도움말</a>
            <a href="#">이용 가이드</a>
            <a href="#">문의하기</a>
          </div>
          <div className="link-group">
            <h4>법적 고지</h4>
            <a href="#">개인정보 처리방침</a>
            <a href="#">이용약관</a>
          </div>
        </div>
      </div>
      
      <div className="container footer-bottom">
        <p>&copy; 2025 StudyLink. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;