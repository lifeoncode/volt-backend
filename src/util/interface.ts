export interface User {
  username: string;
  email: string;
  password: string;
  secret_key: string;
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
  user: any;
  service: string;
  email: string;
  password: string;
  username?: string;
  notes?: string;
}

export interface PaymentCredential {
  user: any;
  card_holder: string;
  card_number: string;
  card_expiry: string;
  security_code: string;
  card_type: string;
  notes?: string;
}
