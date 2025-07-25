export type User = {
  id?: string;
  username: string;
  email: string;
  password: string;
  secret_key?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type JWTPayload = {
  userId: string;
  email: string;
};

export type Secret = {
  id?: string;
  user?: any;
  user_id?: string;
  service: string;
  service_user_id: string;
  password: string;
  notes?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type UserToken = {
  id?: string;
  user?: any;
  user_id?: string;
  token: string;
  expires_at: string | Date;
  used_at?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};
