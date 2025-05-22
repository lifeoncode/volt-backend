import { PasswordCredential } from "./interface";
import CryptoJS from "crypto-js";
import nodemailer from "nodemailer";
import logger from "../middleware/logger";
import { storeRecoveryOTPService } from "../services/auth.service";

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

export const encryptPasswordCredential = (data: PasswordCredential, secret: string) => {
  data.password = encryptData(data.password, secret);
  data.service_user_id = encryptData(data.service_user_id, secret);

  return data;
};

export const decryptPasswordCredential = (data: PasswordCredential, secret: string) => {
  data.password = decryptData(data.password, secret);
  data.service_user_id = decryptData(data.service_user_id, secret);

  return data;
};

export const resolveErrorType = (errorMessage: string): number => {
  if (errorMessage.includes("missing") || errorMessage.includes("invalid")) {
    return 400;
  }
  return 500;
};

export const updateExistingCredential = (
  newCredential: PasswordCredential,
  oldCredential: PasswordCredential,
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

export const generateOTP = (): string => {
  let otp = "";
  for (let i = 0; i < 4; i++) {
    otp += Math.floor(Math.random() * 10);
  }

  return otp;
};

export const sendEmail = async (email: string, otp: string): Promise<boolean> => {
  const transporter = nodemailer.createTransport({
    host: "mail.yellogarden.co.za",
    port: 587,
    secure: false,
    auth: {
      user: "volt@yellogarden.co.za",
      pass: "gc2uk44+vZ&D",
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
    <div style="font-size:24px; font-weight:900; background-color:#eee; padding:5px 10px; border-radius:5px; display:inline-block;">${otp}</div>
    <p style="margin-top: 20px;">If you didn't request this, ignore this email.</p>
    <hr style="margin: 20px 0;">
    <p style="font-size: 12px; color: #999;">This is an automated email from Volt, please do not reply.</p>
  </div>
`;

  const mailOptions = {
    from: "volt@yellogarden.co.za",
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
