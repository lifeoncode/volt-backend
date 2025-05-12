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

export interface AddressCredential {
  id?: number;
  user?: any;
  label: string;
  city: string;
  street: string;
  state: string;
  zip_code: string;
  town?: string | undefined | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface PasswordCredential {
  id?: number;
  user?: any;
  user_id?: number;
  service: string;
  email: string;
  password: string;
  username?: string | null;
  notes?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface PaymentCredential {
  id?: number;
  user_id?: number;
  user?: any;
  card_holder: string;
  card_number: string;
  card_expiry: string;
  security_code: string;
  card_type: string;
  notes?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
