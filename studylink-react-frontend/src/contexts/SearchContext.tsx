// src/contexts/SearchContext.tsx
import React, { createContext, useState, useContext, type ReactNode } from 'react';

// Search Context의 값에 대한 타입 정의
interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  // 필요하다면, 검색 버튼 클릭 여부나 필터링 옵션 등을 추가할 수 있음
}

// 초기값 (나중에 Provider에서 실제 값을 제공)
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Search Context Provider 컴포넌트
interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const value = {
    searchTerm,
    setSearchTerm,
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

// Search Context를 쉽게 사용할 수 있도록 하는 커스텀 Hook
// eslint-disable-next-line react-refresh/only-export-components
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};