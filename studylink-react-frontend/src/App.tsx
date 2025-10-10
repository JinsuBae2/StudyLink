import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import StudyDetailPage from './pages/StudyDetailPage';
import StudyManagePage from './pages/StudyManagePage';
import MyPage from './pages/MyPage';
import ProfileEditPage from './pages/ProfileEditPage';
import CreateStudyPage from './pages/CreateStudyPage';

// 로그인된 사용자만 접근 가능한 라우트
const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* HomePage는 이제 PrivateRoute로 보호됨 */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/study/:id" // ':id'는 URL 파라미터로 스터디 ID를 받음
            element={
              <PrivateRoute>
                <StudyDetailPage />
              </PrivateRoute>
            } 
          />

          <Route 
              path="/study/:id/manage" 
              element={
                <PrivateRoute>
                  <StudyManagePage />
                </PrivateRoute>
              } 
            />
          <Route
            path="/create-study"
            element={
              <PrivateRoute>
                <CreateStudyPage/>
              </PrivateRoute>
            }
          />

          <Route
            path="/mypage"
            element={
              <PrivateRoute>
                <MyPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/edit" 
            element={
              <PrivateRoute>
                <ProfileEditPage /> 
              </PrivateRoute>
            } 
          />
          
          </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;