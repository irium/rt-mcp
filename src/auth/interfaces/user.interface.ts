export interface User {
  username: string;
  passwordHash: string;
  role: 'admin' | 'user';
}

export interface JwtPayload {
  sub: string; // username
  username: string;
  role: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    username: string;
    role: string;
  };
}
