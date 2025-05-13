import { AddressCredential, PasswordCredential, PaymentCredential } from "./interface";
import CryptoJS from "crypto-js";
import nodemailer from "nodemailer";
import logger from "../middleware/logger";
import path from "node:path";
import fs from "node:fs";

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

const storeFile = (filePath: string, fileData: string) => {
  try {
    fs.writeFileSync(filePath, fileData);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};

const generateOTP = (email: string): string => {
  let otp = "";
  for (let i = 0; i < 4; i++) {
    otp += Math.floor(Math.random() * 10);
  }

  const filePath = path.join(__dirname, "../data", "user", "recovery.txt");
  storeFile(filePath, `${email} - ${otp}`);

  return otp;
};

export const sendEmail = async (email: string): Promise<boolean> => {
  const transporter = nodemailer.createTransport({
    host: "mail.yellogarden.co.za",
    port: 587,
    secure: false,
    auth: {
      user: "nduduzo@yellogarden.co.za",
      pass: "d2zX*!v((x.-",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const emailContent = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 800px; margin: auto;">
    <h2 style="color:rgb(73, 24, 250);">Recover your account</h2>
    <p>Hi there,</p>
    <p>Looks like you're trying to recover your account for some reason. Here's your recovery pin:</p>
    <div style="font-size:24px; font-weight:900; background-color:#eee; padding:5px 10px; border-radius:5px; display:inline-block;">${generateOTP(
      email
    )}</div>
    <p style="margin-top: 20px;">If you didn't request this, ignore this email.</p>
    <hr style="margin: 20px 0;">
    <p style="font-size: 12px; color: #999;">This is an automated email from Volt, please do not reply.</p>
  </div>
`;

  const mailOptions = {
    from: "nduduzo@yellogarden.co.za",
    to: email,
    subject: "Volt account recovery",
    html: emailContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info("Email sent: " + info.response);
    return true;
  } catch (error: any) {
    logger.error(error.message);
    return false;
  }
};
