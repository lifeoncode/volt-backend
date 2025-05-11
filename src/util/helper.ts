import {AddressCredential, PasswordCredential, PaymentCredential} from "./interface";
import CryptoJS from "crypto-js";

const secretKey: string = process.env.CRYPTO_SECRET_KEY!;

export const generateSecretKey = () => {
    return crypto.randomBytes(32).toString('hex');
}

const encryptData = (data: string | undefined | null) => {
    if (!data) throw new Error("No data provided for encryption");
    return CryptoJS.AES.encrypt(data, secretKey).toString();
};

const decryptData = (data: string | undefined | null) => {
    if (!data) throw new Error("No data provided for decryption");
    const bytes = CryptoJS.AES.decrypt(data, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};

export const encryptAddressCredential = (data:AddressCredential) => {
    data.city = encryptData(data.city);
    data.street = encryptData(data.street);
    data.zip_code = encryptData(data.zip_code);
    return data;
}

export const encryptPasswordCredential = (data:PasswordCredential) => {
    data.password = encryptData(data.password);
    data.email = encryptData(data.email);
    return data;
}

export const encryptPaymentCredential = (data:PaymentCredential) => {
    data.security_code = encryptData(data.security_code);
    data.card_number = encryptData(data.card_number);
    data.card_expiry = encryptData(data.card_expiry);
    return data;
}

export const decryptAddressCredential = (data:AddressCredential) => {
    data.city = decryptData(data.city);
    data.street = decryptData(data.street);
    data.zip_code = decryptData(data.zip_code);
    return data;
}

export const decryptPasswordCredential = (data:PasswordCredential) => {
    data.password = decryptData(data.password);
    data.email = decryptData(data.email);
    return data;
}

export const decryptPaymentCredential = (data:PaymentCredential) => {
    data.security_code = decryptData(data.security_code);
    data.card_number = decryptData(data.card_number);
    data.card_expiry = decryptData(data.card_expiry);
    return data;
}

export const resolveErrorType = (errorMessage: string): number => {
    if (errorMessage.includes("missing") || errorMessage.includes("invalid")) {
        return 400
    }
    return 500;
}


