import axios, { AxiosError } from 'axios';

// --- Axios 클라이언트 설정 ---
const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // 백엔드 서버 주소
  headers: {
    'Content-Type': 'application/json',
  }
});

// 👇 [추가] 모든 요청 전에 실행될 인터셉터 설정
apiClient.interceptors.request.use(
    config => {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  // --- 응답 인터셉터: 인증 에러 처리 (401 Unauthorized 등) ---
apiClient.interceptors.response.use(
    response => response, // 성공적인 응답은 그대로 반환
    (error: AxiosError) => { // 에러 발생 시
      // 401 (Unauthorized) 에러 발생 시 로그인 페이지로 리다이렉트
      if (error.response && error.response.status === 401) {
        // 중요: 여기서는 직접 localStorage를 지우고 페이지 이동을 처리합니다.
        // AuthContext의 logout 함수를 직접 호출할 수는 없으니 (Context 외부에 있기 때문에)
        // 수동으로 처리하거나, 별도의 전역 이벤트/함수를 사용하는 방법도 고려할 수 있습니다.
        localStorage.removeItem('jwt_token');
        // window.location.href 대신 react-router-dom의 useNavigate를 사용해야 하지만,
        // 인터셉터는 React 컴포넌트 밖이라 useNavigate를 직접 쓸 수 없음.
        // 따라서, App 컴포넌트에서 AuthProvider가 제공하는 logout 함수를 사용하거나,
        // 여기서는 일단 간편하게 window.location.href를 사용.
        // 더 나은 방법: App.tsx의 AuthProvider에서 axios 인스턴스를 주입하거나,
        //           AuthContext 내부에 interceptor 설정을 포함시키는 방법.
        console.log('401 Unauthorized: 토큰 만료 또는 유효하지 않음. 로그인 페이지로 이동.');
        window.location.href = '/login'; // 로그인 페이지로 강제 리다이렉트
      }
      return Promise.reject(error);
    }
  );

// --- 타입 정의 (Interface) ---

// 백엔드의 UserSignupRequestDto와 똑같이 생긴 타입 정의
export interface SignupData {
  email: string;
  password?: string;
  nickname?: string;
  birthDate?: string; // "YYYY-MM-DD" 형식
  career?: 'NEWBIE' | 'JUNIOR' | 'SENIOR';
  job?: string;
  goal?: string;
  studyStyle?: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  region?: string;
  tags?: string[];
}

// 백엔드의 LoginResponseDto와 똑같이 생긴 타입 정의
export interface LoginResponse {
  accessToken: string;
}

// 백엔드의 StudyGroupListResponseDto와 유사한 타입
export interface StudyGroup {
    id: number;
    title: string;
    topic: string;
    creatorNickname: string;
    recruitmentDeadline: string;
    matchScore?: number; // 추천 스터디의 경우에만 존재
  }

// 👇 [수정] 백엔드 StudyGroupDetailResponseDto와 완벽하게 일치
export interface StudyGroupDetail {
    id: number;
    title: string;
    topic: string;
    description: string;
    goal: string;
    memberCount: number;
    recruitmemtDeadLine: string; // LocalDate는 string으로 받음
    region: string;
    creatorNickname: string;
    creatorId: number;
    createAt: string; // LocalDateTime은 string으로 받음
    // 백엔드 DTO에 없는 필드들은 제외 (예: tags, studyStartDate, studyEndDate 등)
    // 필요한 경우 백엔드 DTO를 확장하거나, 프론트에서 필요한 필드를 추가해야 함.
}


export interface ApplicationData {
  message: string;
}

export interface Application {
  applicationId: number;
  applicantNickname: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}


// --- API 호출 함수들 ---

/**
 * 로그인 API 호출 함수
 * @param email 사용자 이메일
 * @param password 사용자 비밀번호
 * @returns Promise with LoginResponse
 */
export const login = (email: string, password: string) => {
  return apiClient.post<LoginResponse>('/api/auth/login', { email, password });
};

/**
 * 회원가입 API 호출 함수
 * @param userData 회원가입 폼 데이터
 * @returns Promise
 */
export const signup = (userData: SignupData) => {
  return apiClient.post('/api/auth/signup', userData);
};

// 스터디 그룹 목록 조회 API
export const getStudyGroups = (params: { sort?: string; region?: string } = {}) => {
    return apiClient.get<StudyGroup[]>('/api/study-groups', { params });
  };
  
// 추천 스터디 그룹 목록 조회 API (v1 또는 v2 선택)
export const getRecommendedStudyGroups = () => {
    return apiClient.get<StudyGroup[]>('/api/study-groups/recommendations');
};

export const getStudyGroupDetail = (id: number) => {
    return apiClient.get<StudyGroupDetail>(`/api/study-groups/${id}`);
};

export const applyToStudyGroup = (groupId: number, data: ApplicationData) => {
  return apiClient.post(`/api/study-groups/${groupId}/applications`, data);
};

// 그룹장이 신청 목록을 조회하는 API
export const getApplicationsForStudy = (groupId: number) => {
  return apiClient.get<Application[]>(`/api/study-groups/${groupId}/applications`);
};

// 그룹장이 신청을 처리하는 API
export const processApplication = (groupId: number, applicationId: number, data: { status: 'ACCEPTED' | 'REJECTED' }) => {
  return apiClient.post(`/api/study-groups/${groupId}/applications/${applicationId}/process`, data);
};

// TODO: 앞으로 만들 다른 API 호출 함수들을 여기에 추가...
// 예: export const getStudyGroups = () => apiClient.get('/api/study-groups');