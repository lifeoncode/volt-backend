import { Secret } from "./types";
import CryptoJS from "crypto-js";
import nodemailer from "nodemailer";
import logger from "../middleware/logger";
import { InternalServerError } from "../middleware/errors";

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
