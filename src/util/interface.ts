export interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
  secret_key?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface JWTPayload {
  userId: number;
  email: string;
}

export interface PasswordCredential {
  id?: number;
  user?: any;
  user_id?: number;
  service: string;
  service_user_id: string;
  password: string;
  notes?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
