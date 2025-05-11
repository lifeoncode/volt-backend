import { AddressCredential, PasswordCredential, PaymentCredential } from "./interface";
import CryptoJS from "crypto-js";

export const generateSecretKey = () => {
  return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
};

const encryptData = (data: string | undefined | null, secretKey: string) => {
  if (!data) throw new Error("No data provided for encryption");
  return CryptoJS.AES.encrypt(data, secretKey).toString();
};

const decryptData = (data: string | undefined | null, secretKey: string) => {
  if (!data) throw new Error("No data provided for decryption");
  const bytes = CryptoJS.AES.decrypt(data, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const encryptAddressCredential = (data: AddressCredential, secret: string) => {
  data.city = encryptData(data.city, secret);
  data.street = encryptData(data.street, secret);
  data.zip_code = encryptData(data.zip_code, secret);

  return data;
};

export const encryptPasswordCredential = (data: PasswordCredential, secret: string) => {
  data.password = encryptData(data.password, secret);
  data.email = encryptData(data.email, secret);

  return data;
};

export const encryptPaymentCredential = (data: PaymentCredential, secret: string) => {
  data.security_code = encryptData(data.security_code, secret);
  data.card_number = encryptData(data.card_number, secret);
  data.card_expiry = encryptData(data.card_expiry, secret);

  return data;
};

export const decryptAddressCredential = (data: AddressCredential, secret: string) => {
  data.city = decryptData(data.city, secret);
  data.street = decryptData(data.street, secret);
  data.zip_code = decryptData(data.zip_code, secret);

  return data;
};

export const decryptPasswordCredential = (data: PasswordCredential, secret: string) => {
  data.password = decryptData(data.password, secret);
  data.email = decryptData(data.email, secret);

  return data;
};

export const decryptPaymentCredential = (data: PaymentCredential, secret: string) => {
  data.security_code = decryptData(data.security_code, secret);
  data.card_number = decryptData(data.card_number, secret);
  data.card_expiry = decryptData(data.card_expiry, secret);

  return data;
};

export const resolveErrorType = (errorMessage: string): number => {
  if (errorMessage.includes("missing") || errorMessage.includes("invalid")) {
    return 400;
  }
  return 500;
};

export const updateExistingCredential = (
  newCredential: AddressCredential | PasswordCredential | PaymentCredential,
  oldCredential: AddressCredential | PasswordCredential | PaymentCredential,
  secretKey: string
) => {
  const credentials: string[] = [];
  const result: Record<string, any> = {};
  const valuesToHide: string[] = [
    "city",
    "street",
    "zip_code",
    "password",
    "email",
    "security_code",
    "card_number",
    "card_exppiry",
  ];

  for (let [key, value] of Object.entries(newCredential)) {
    if (value) {
      if (valuesToHide.includes(key)) {
        credentials.push(`${key}:${encryptData(value, secretKey)}`);
      } else {
        credentials.push(`${key}:${value}`);
      }
    }
  }

  credentials.forEach((credential) => {
    const key = credential.split(":")[0];
    const value = credential.split(":")[1];

    if (key in oldCredential) {
      result[key] = value;
    }
  });

  return result;
};
