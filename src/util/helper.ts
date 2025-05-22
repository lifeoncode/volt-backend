import { PasswordCredential } from "./interface";
import CryptoJS from "crypto-js";
import nodemailer from "nodemailer";
import logger from "../middleware/logger";
import { storeRecoveryOTPService } from "../services/auth.service";

/**
 * @func generateSecretKey
 *
 * @description
 * Generates an encrypted hash.
 *
 * @returns {String}
 */
export const generateSecretKey = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
};

/**
 * @func encryptData
 *
 * @description
 * Encrypts data.
 *
 * @param {String} data - Data to encrypt
 * @param {String} secretKey - Secret to perform encryption
 *
 * @returns {String}
 */
export const encryptData = (data: string | undefined | null, secretKey: string): string => {
  if (!data) throw new Error("No data provided for encryption");
  return CryptoJS.AES.encrypt(data, secretKey).toString();
};

/**
 * @func decryptData
 *
 * @description
 * Decrypts data.
 *
 * @param {String} data - Data to decrypt
 * @param {String} secretKey - Secret to perform decryption
 *
 * @returns {String}
 */
export const decryptData = (data: string | undefined | null, secretKey: string): string => {
  if (!data) throw new Error("No data provided for decryption");
  const bytes = CryptoJS.AES.decrypt(data, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * @func encryptPasswordCredential
 *
 * @description
 * encrypts PasswordCredential.
 *
 * @param {String} data - PasswordCredential to encrypt
 * @param {String} secret - Secret to perform encryption
 *
 * @returns {PasswordCredential}
 */
export const encryptPasswordCredential = (data: PasswordCredential, secret: string): PasswordCredential => {
  data.password = encryptData(data.password, secret);
  data.service_user_id = encryptData(data.service_user_id, secret);

  return data;
};

/**
 * @func decryptPasswordCredential
 *
 * @description
 * decrypts PasswordCredential.
 *
 * @param {String} data - PasswordCredential to decrypt
 * @param {String} secret - Secret to perform decryption
 *
 * @returns {PasswordCredential}
 */
export const decryptPasswordCredential = (data: PasswordCredential, secret: string): PasswordCredential => {
  data.password = decryptData(data.password, secret);
  data.service_user_id = decryptData(data.service_user_id, secret);

  return data;
};

/**
 * @func resolveErrorType
 *
 * @description
 * Resolves request errors.
 *
 * @param {String} errorMessage - Error message to determine error type
 *
 * @returns {number}
 */
export const resolveErrorType = (errorMessage: string): number => {
  const message: string = errorMessage.toLowerCase();
  if (message.includes("missing") || message.includes("invalid")) {
    return 400;
  }
  return 500;
};

/**
 * @func updateExistingCredential
 *
 * @description
 * Resolves PasswordCredential attributes updating.
 *
 * @param {PasswordCredential} newCredential - New PasswordCredential attributes
 * @param {PasswordCredential} newCredential - Existing PasswordCredential attributes
 *
 * @returns {Record<string, unknown>}
 */
export const updateExistingCredential = (
  newCredential: PasswordCredential,
  oldCredential: PasswordCredential,
  secretKey: string
): Record<string, unknown> => {
  const credentials: string[] = [];
  const result: Record<string, unknown> = {};

  for (let [key, value] of Object.entries(newCredential)) {
    if (value) {
      credentials.push(`${key}:${encryptData(value, secretKey)}`);
    }
  }

  credentials.forEach((credential) => {
    const key = credential.split(":")[0];
    const value = credential.split(":")[1];
    result[key] = value;
  });

  return result;
};

/**
 * @func generateOTP
 *
 * @description
 * Generates a  4-digit pin.
 *
 * @returns {String}
 */
export const generateOTP = (): string => {
  let otp = "";
  for (let i = 0; i < 4; i++) {
    otp += Math.floor(Math.random() * 10);
  }

  return otp;
};

/**
 * @func sendEmail
 *
 * @description
 * Sends email to User email address for account recovery.
 *
 * @param {String} email - User email
 * @param {String} otp - Generated 4-digit pin
 *
 * @returns {boolean}
 *
 * @sideEffects
 * Logs email event on success. Logs error message on failure
 */
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
