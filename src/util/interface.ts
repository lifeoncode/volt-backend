export interface User {
  id?: string;
  username: string;
  email: string;
  password: string;
  secret_key?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface JWTPayload {
  userId: string;
  email: string;
}

export interface PasswordCredential {
  id?: string;
  user?: any;
  user_id?: string;
  service: string;
  service_user_id: string;
  password: string;
  notes?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
