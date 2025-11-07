import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div>
      <Header />
      <main style={{ minHeight: 'calc(100vh - 160px)' }}> {/* 헤더와 푸터 높이를 제외한 만큼 최소 높이 확보 */}
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;