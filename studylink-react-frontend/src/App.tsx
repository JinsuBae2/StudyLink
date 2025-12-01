// src/App.tsx
 import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
 import { AuthProvider } from './contexts/AuthContext';
 import { SearchProvider } from './contexts/SearchContext';
 import HomePage from './pages/HomePage';
 import LoginPage from './pages/LoginPage';
 import SignupPage from './pages/SignupPage';
 import MyPage from './pages/MyPage';
 import StudyDetailPage from './pages/StudyDetailPage';
 import StudyCreatePage from './pages/CreateStudyPage';
 import StudyManagePage from './pages/StudyManagePage';
 import ProfileEditPage from './pages/ProfileEditPage';
 import SearchResultPage from './pages/SearchResultPage'; 
 import PrivateRoute from './components/PrivateRoute';
 import Header from './components/Header';
 import Footer from './components/Footer';
import StudyEditPage from './pages/StudyEditPage';

 function App() {
   return (
     <Router>
       <AuthProvider>
         <SearchProvider>
           <Header />
           <div className="main-content-wrapper"> {/* 모든 페이지 콘텐츠를 감싸는 래퍼 추가 */}
             <Routes>
               <Route path="/" element={<HomePage />} />
               <Route path="/login" element={<LoginPage />} />
               <Route path="/signup" element={<SignupPage />} />
              <Route path="/search" element={<SearchResultPage />} /> 

               {/* 보호된 라우트 */}
               <Route path="/mypage" element={<PrivateRoute><MyPage /></PrivateRoute>} />
               <Route path="/profile/edit" element={<PrivateRoute><ProfileEditPage /></PrivateRoute>} />
               <Route path="/study/create" element={<PrivateRoute><StudyCreatePage /></PrivateRoute>} />
               <Route path="/study/:id" element={<PrivateRoute><StudyDetailPage /></PrivateRoute>} />
               <Route path="/study/:id/manage" element={<PrivateRoute><StudyManagePage /></PrivateRoute>} />
               <Route path="/study/:id/edit" element={<PrivateRoute><StudyEditPage /></PrivateRoute>} />
             </Routes>
           </div>
           <Footer />
         </SearchProvider>
       </AuthProvider>
     </Router>
   );
 }

 export default App;