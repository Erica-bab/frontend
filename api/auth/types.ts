export interface College {
  id: number;
  name: string;
}

export interface User {
  id: number;
  google_id?: string;
  apple_id?: string;
  email: string;
  student_year: string | null;
  college: College | null;
  contribution_count: number;
  edit_count: number;
  last_login_at: string;
  created_at: string;
  requires_setup: boolean;
}

export interface AuthConfig {
  google_client_id: string;
}

export interface GoogleLoginRequest {
  id_token?: string;  // 웹/안드로이드용
  authorization_code?: string;  // iOS용
  redirect_uri?: string;  // iOS용 (Authorization Code 사용 시 필수)
}

export interface AppleLoginRequest {
  identity_token: string;
  user?: {
    email: string;
    name?: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UpdateUserRequest {
  student_year?: string;
  college_id?: number;
  student_type?: 'student' | 'other';
}
