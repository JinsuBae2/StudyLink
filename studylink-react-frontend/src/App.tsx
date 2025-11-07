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
 import SearchResultPage from './pages/SearchResultPage'; // 👈 SearchResultPage 임포트
 import PrivateRoute from './components/PrivateRoute';
 import Header from './components/Header';
 import Footer from './components/Footer';

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
              <Route path="/search" element={<SearchResultPage />} /> {/* 👈 검색 결과 페이지 라우트 추가 */}

               {/* 보호된 라우트 */}
               <Route element={<PrivateRoute children={undefined} />}>
                 <Route path="/mypage" element={<MyPage />} />
                 <Route path="/profile/edit" element={<ProfileEditPage />} />
                 <Route path="/create-study" element={<StudyCreatePage />} />
                 <Route path="/study/:id" element={<StudyDetailPage />} />
                 <Route path="/study/:id/manage" element={<StudyManagePage />} />
               </Route>
             </Routes>
           </div>
           <Footer />
         </SearchProvider>
       </AuthProvider>
     </Router>
   );
 }

 export default App;