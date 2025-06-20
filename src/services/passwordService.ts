import { PrismaClient } from "../../generated/prisma";
import { ConflictError, NotFoundError } from "../middleware/errors";
import { decryptPasswordCredential } from "../util/helper";
import { PasswordCredential } from "../util/types";
import { getUserService } from "./userService";

const prisma = new PrismaClient();

/**
 * @service createPasswordCredentialService
 *
 * @description
 * Persists a new PasswordCredential in DB.
 *
 * @param {PasswordCredential} data - PasswordCredential obj
 *
 * @returns {PasswordCredential}
 */
export const createPasswordCredentialService = async (
  userId: string,
  data: PasswordCredential
): Promise<PasswordCredential> => {
  const { secret_key: secret } = await getUserService(userId);
  const decryptedData = decryptPasswordCredential(data, secret as string);

  const existingPasswordCredential = await prisma.passwordCredential.findFirst({
    where: { service: decryptedData.service, service_user_id: decryptedData.service_user_id },
  });
  if (existingPasswordCredential) throw new ConflictError("Credential already exists");

  const newPasswordCredential = await prisma.passwordCredential.create({
    data: {
      service: data.service,
      service_user_id: data.service_user_id,
      password: data.password,
      notes: data?.notes,
      user: { connect: { id: data.user } },
    },
  });

  return newPasswordCredential;
};

/**
 * @service getAllPasswordCredentialsService
 *
 * @description
 * Queries DB for all PasswordCredential objs for a User.
 *
 * @param {string} userId - User id
 *
 * @returns {PasswordCredential[]}
 */
export const getAllPasswordCredentialsService = async (userId: string | undefined): Promise<PasswordCredential[]> => {
  return prisma.passwordCredential.findMany({ where: { user_id: userId } });
};

/**
 * @service getSinglePasswordCredentialService
 *
 * @description
 * Queries DB for a specific PasswordCredential obj for a User.
 *
 * @param {string} userId - User id
 * @param {string} credentialId - PasswordCredential id
 *
 * @returns {PasswordCredential}
 */
export const getSinglePasswordCredentialService = async (
  userId: string | undefined,
  credentialId: string
): Promise<PasswordCredential> => {
  const credentials = await prisma.passwordCredential.findMany({
    where: { user_id: userId },
  });
  if (credentials.length === 0) throw new NotFoundError("No credentials found");

  const matchedCredential = credentials.find((item) => item.id === credentialId);
  if (!matchedCredential) throw new NotFoundError("No credentials found");

  return matchedCredential;
};

/**
 * @service updatePasswordCredentialService
 *
 * @description
 * Persists a specific updated PasswordCredential.
 *
 * @param {string} userId - User id
 * @param {string} credentialId - PasswordCredential id
 * @param {Record<string, unknown>} newCredentialData - PasswordCredential attributes
 *
 * @returns {PasswordCredential}
 */
export const updatePasswordCredentialService = async (
  userId: string | undefined,
  credentialId: string,
  newCredentialData: any
): Promise<PasswordCredential> => {
  const matchedCredential = await prisma.passwordCredential.findFirst({
    where: { user_id: userId, id: credentialId },
  });
  if (!matchedCredential) throw new NotFoundError("No credentials found");

  return prisma.passwordCredential.update({
    where: { user_id: userId, id: credentialId },
    data: newCredentialData,
  });
};

/**
 * @service deletePasswordCredentialService
 *
 * @description
 * Removes a specific PasswordCredential from DB.
 *
 * @param {string} userId - User id
 * @param {string} credentialId - PasswordCredential id
 *
 * @returns {PasswordCredential}
 */
export const deletePasswordCredentialService = async (
  userId: string | undefined,
  credentialId: string
): Promise<PasswordCredential> => {
  const matchedCredential = await prisma.passwordCredential.findFirst({
    where: { user_id: userId, id: credentialId },
  });
  if (!matchedCredential) throw new NotFoundError("No credentials found");

  return prisma.passwordCredential.delete({
    where: { user_id: userId, id: credentialId },
  });
};

/**
 * @service deletePasswordCredentialService
 *
 * @description
 * Removes a specific PasswordCredential from DB.
 *
 * @param {string} userId - User id
 *
 * @returns {Record<string, unknown>}
 */
export const deleteAllPasswordCredentialsService = async (userId: string): Promise<Record<string, unknown>> => {
  const credentials = await getAllPasswordCredentialsService(userId);
  if (credentials.length === 0) throw new NotFoundError("No credentials found");

  return await prisma.passwordCredential.deleteMany({ where: { user_id: userId } });
};
