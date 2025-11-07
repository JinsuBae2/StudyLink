// src/api/apiService.ts
import axios from 'axios';
import type { AxiosError, AxiosResponse } from 'axios';

// --- Axios 클라이언트 설정 ---
const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // 백엔드 서버 주소
  headers: {
    'Content-Type': 'application/json',
  }
});

// 요청 인터셉터: 모든 요청에 JWT 토큰 자동 추가
apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('jwt_token'); 
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

// 응답 인터셉터: 401 에러 시 자동 로그아웃
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('jwt_token');
        console.log('401 Unauthorized: 토큰 만료. 로그인 페이지로 이동.');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
);

// ==========================================================
// 백엔드 DTO에 매핑되는 프론트엔드 인터페이스 (네 코드 100% 반영)
// ==========================================================

// --- Auth DTOs ---
// UserLoginDto
export interface LoginRequest {
  email: string;
  password: string;
}
// LoginResposeDto (백엔드 오타 'Respose' 반영)
export interface LoginResponse {
  accessToken: string;
}
// UserSignupRequestDto
export interface SignupData {
  email: string;
  password?: string;
  nickname?: string;
  career?: 'NEWBIE' | 'JUNIOR' | 'SENIOR';
  birthDate?: string;
  job?: string;
  goal?: string;
  studyStyle?: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  tags?: string[];
  region?: string;
}

// --- User/MyPage DTOs ---
// UserProfileResponseDto (모든 필드 포함)
export interface UserProfileResponse {
  id: number;
  email: string;
  nickname: string;
  birthDate: string;
  career: 'NEWBIE' | 'JUNIOR' | 'SENIOR' | null;
  job: string | null;
  goal: string | null;
  studyStyle: 'ONLINE' | 'OFFLINE' | 'HYBRID' | null;
  region: string | null;
  tags: string[];
  createdAt: string;
}
// UserProfileUpdateRequestDto
export interface UserProfileUpdateRequest {
  nickname?: string;
  career?: 'NEWBIE' | 'JUNIOR' | 'SENIOR';
  job?: string;
  goal?: string;
  studyStyle?: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  tags?: string[];
  region?: string;
}

// --- StudyGroup DTOs ---
// StudyGroupListResponseDto (태그/멤버 수 없음)
export interface StudyGroupListResponse {
  id: number;
  title: string;
  topic: string;
  creatorNickname: string;
  recruitmentDeadline: string;
  region: string;
}
// RecommendedStudyGroupDto (오타 'DeadLine' 포함)
export interface RecommendedStudyGroup {
  id: number;
  title: string;
  topic: string;
  creatorNickname: string;
  recruitmentDeadLine: string; 
  matchScore: number;
}
// StudyGroupDetailResponseDto (모든 필드 포함)
export interface StudyGroupDetailResponse {
  id: number;
  title: string;
  topic: string;
  description: string;
  goal: string;
  currentMemberCount: number;
  maxMemberCount: number;
  region: string;
  studyStyle: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  tags: string[];
  creatorId: number;
  creatorNickname: string;
  recruitmentDeadline: string;
  createdAt: string;
}
// StudyGroupCreateRequestDto
export interface StudyGroupCreateRequest {
  title: string;
  topic: string;
  description: string;
  goal: string;
  memberCount: number;
  studyStyle: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  region?: string;
  tags: string[];
  recruitmentDeadline: string;
}
// StudyGroupUpdateRequestDto
export interface StudyGroupUpdateRequest {
  title?: string;
  topic?: string;
  description?: string;
  goal?: string;
  memberCount?: number;
  recruitmentDeadline?: string;
  region?: string;
  studyStyle?: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  tags?: string[];
}

// --- MyPage DTOs ---
// MyCreatedStudyGroupResponseDto & MyParticipatingStudyGroupResponseDto
export interface MyStudyGroupResponse {
  id: number;
  title: string;
  topic: string;
  currentParticipants: number;
  maxParticipants: number;
  recruitmentDeadline: string;
}
// MemberApplicationResponseDto
export interface MemberApplicationResponse {
  applicationId: number;
  studyGroupId: number;
  studyGroupTitle: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  appliedAt: string;
}

// --- Application DTOs ---
// ApplicationRequestDto
export interface ApplicationData {
  message: string;
}
// ApplicationResponseDto
export interface ApplicationResponse {
  applicationId: number;
  applicantNickname: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}
// ApplicationProcessRequestDto
export interface ApplicationProcessRequest {
  status: 'ACCEPTED' | 'REJECTED';
}

// ==========================================================
// API 서비스 함수들 (Controller에 100% 일치)
// ==========================================================

// --- AuthController ---
export const login = (data: LoginRequest): Promise<AxiosResponse<LoginResponse>> => {
  return apiClient.post('/api/auth/login', data);
};
export const signup = (data: SignupData): Promise<AxiosResponse<string>> => {
  return apiClient.post('/api/auth/signup', data);
};

// --- UserController ---
export const getMyProfile = (): Promise<AxiosResponse<UserProfileResponse>> => {
  return apiClient.get('/api/members/me');
};
export const getMyApplications = (): Promise<AxiosResponse<MemberApplicationResponse[]>> => {
  return apiClient.get('/api/members/me/applications');
};
export const getMyParticipatingStudyGroups = (): Promise<AxiosResponse<MyStudyGroupResponse[]>> => {
  return apiClient.get('/api/members/me/study-groups');
};
export const getMyCreatedStudyGroups = (): Promise<AxiosResponse<MyStudyGroupResponse[]>> => {
  return apiClient.get('/api/members/me/created-study-groups');
};
export const updateMyProfile = (data: UserProfileUpdateRequest): Promise<AxiosResponse<string>> => {
  return apiClient.put('/api/members/me', data);
};

// --- StudyGroupController ---
export const createStudyGroup = (data: StudyGroupCreateRequest): Promise<AxiosResponse<StudyGroupDetailResponse>> => {
  return apiClient.post('/api/study-groups', data);
};
export const getStudyGroups = (params: { region?: string; sort?: string; search?: string  } = {}) => {
  return apiClient.get<StudyGroupListResponse[]>('/api/study-groups', { params });
};
export const getStudyGroupDetail = (id: number): Promise<AxiosResponse<StudyGroupDetailResponse>> => {
  return apiClient.get(`/api/study-groups/${id}`);
};
export const updateStudyGroup = (id: number, data: StudyGroupUpdateRequest): Promise<AxiosResponse<StudyGroupDetailResponse>> => {
  return apiClient.put(`/api/study-groups/${id}`, data);
};
export const deleteStudyGroup = (id: number): Promise<AxiosResponse<string>> => {
  return apiClient.delete(`/api/study-groups/${id}`);
};
export const getRecommendedStudyGroups = (): Promise<AxiosResponse<RecommendedStudyGroup[]>> => {
  return apiClient.get('/api/study-groups/recommendations');
};
export const getRecommendedStudyGroupsV2 = (): Promise<AxiosResponse<RecommendedStudyGroup[]>> => {
  return apiClient.get('/api/study-groups/recommendations/v2');
};

// --- ApplicationController ---
export const applyToStudyGroup = (groupId: number, data: ApplicationData): Promise<AxiosResponse<string>> => {
  return apiClient.post(`/api/study-groups/${groupId}/applications`, data);
};
export const getApplicationsForStudy = (groupId: number): Promise<AxiosResponse<ApplicationResponse[]>> => {
  return apiClient.get(`/api/study-groups/${groupId}/applications`);
};
export const processApplication = (groupId: number, applicationId: number, data: ApplicationProcessRequest): Promise<AxiosResponse<string>> => {
  return apiClient.post(`/api/study-groups/${groupId}/applications/${applicationId}/process`, data);
};

