import { Secret } from "./types";
import CryptoJS from "crypto-js";
import nodemailer from "nodemailer";
import logger from "../middleware/logger";
import { InternalServerError } from "../middleware/errors";

const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const ENVIRONMENT = process.env.NODE_ENV;

/**
 * @func isDev
 *
 * @description
 * Checks if application is running in development environment.
 *
 * @returns {Boolean}
 */
export const isDev = (): boolean => {
  return ENVIRONMENT === "development";
};

/**
 * @func isProd
 *
 * @description
 * Checks if application is running in production environment.
 *
 * @returns {Boolean}
 */
export const isProd = (): boolean => {
  return ENVIRONMENT === "production";
};

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
  if (!data) throw new InternalServerError("No data to encrypt");
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
  if (!data) throw new InternalServerError("No data to decrypt");
  const bytes = CryptoJS.AES.decrypt(data, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * @func encryptSecret
 *
 * @description
 * encrypts Secret.
 *
 * @param {String} data - Secret to encrypt
 * @param {String} secret - Secret to perform encryption
 *
 * @returns {Secret}
 */
export const encryptSecret = (data: Secret, secret: string): Secret => {
  data.password = encryptData(data.password, secret);
  data.service_user_id = encryptData(data.service_user_id, secret);

  return data;
};

/**
 * @func decryptSecret
 *
 * @description
 * decrypts Secret.
 *
 * @param {String} data - Secret to decrypt
 * @param {String} secret - Secret to perform decryption
 *
 * @returns {Secret}
 */
export const decryptSecret = (data: Secret, secret: string): Secret => {
  console.log(data);

  data.password = decryptData(data.password, secret);
  data.service_user_id = decryptData(data.service_user_id, secret);
  if (data.notes) data.notes = decryptData(data.notes, secret);

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
 * @func updateExistingSecret
 *
 * @description
 * Resolves Secret attributes updating.
 *
 * @param {Secret} newSecret - New Secret attributes
 * @param {Secret} oldSecret - Existing Secret attributes
 *
 * @returns {Record<string, unknown>}
 */
export const updateExistingSecret = (
  newSecret: Secret,
  oldSecret: Secret,
  secretKey: string
): Record<string, unknown> => {
  const credentials: string[] = [];
  const result: Record<string, unknown> = {};

  for (let [key, value] of Object.entries(newSecret)) {
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
 * @func sendEmail
 *
 * @description
 * Sends email to User email address for account recovery.
 *
 * @param {String} email - User email
 *
 * @returns {boolean}
 *
 * @sideEffects
 * Logs email event on success. Logs error message on failure
 */
export const sendEmail = async (email: string): Promise<boolean> => {
  const resetLink: string = isDev() ? "http://localhost:5173/recover/reset" : "https://voltpasswords.xyz/recover/reset";

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: false,
    auth: {
      user: EMAIL_ADDRESS,
      pass: EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const emailContent = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 800px; margin: auto;">
    <h2 style="color:rgb(14, 12, 19); font-size:22px;">Hi there</h2>
    <p style="font-size:18px; color:rgb(14, 12, 19);">It looks like you forgot your password. Click the button below to set a new one and get access to your account.</p>
    <div style="padding:10px 0;">
      <a href="${resetLink}" style="color:#fff; text-decoration:none;">
        <div style="display:inline-block; background-color:rgb(73, 24, 250); border-radius:4px; padding:10px 20px; outline:none; border:0; font-size:16px;">Reset password</div>
      </a>
    </div>
    <div style="padding:15px 0">
      <p style="font-size:18px; color:rgb(14, 12, 19);">If you didn't request this, please ignore this email.</p>
    </div>
    <hr style="margin: 10px 0;">
    <p style="font-size: 12px; color:rgb(14, 12, 19);">This is an automated email from Volt, please do not reply.</p>
  </div>
`;

  const mailOptions = {
    from: EMAIL_ADDRESS,
    to: email,
    subject: "Volt Password Reset Request",
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
