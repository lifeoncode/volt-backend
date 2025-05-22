import { PrismaClient } from "../../generated/prisma";
import { PasswordCredential } from "../util/interface";

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
export const createPasswordCredentialService = async (data: PasswordCredential): Promise<PasswordCredential> => {
  const existingPasswordCredential = await prisma.passwordCredential.findFirst({
    where: { service: data.service, service_user_id: data.service_user_id },
  });
  if (existingPasswordCredential) throw new Error("credential already exists");

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
 * @param {number} userId - User id
 *
 * @returns {PasswordCredential[]}
 */
export const getAllPasswordCredentialsService = async (userId: number | undefined): Promise<PasswordCredential[]> => {
  return prisma.passwordCredential.findMany({ where: { user_id: userId } });
};

/**
 * @service getSinglePasswordCredentialService
 *
 * @description
 * Queries DB for a specific PasswordCredential obj for a User.
 *
 * @param {number} userId - User id
 * @param {number} credentialId - PasswordCredential id
 *
 * @returns {PasswordCredential}
 */
export const getSinglePasswordCredentialService = async (
  userId: number | undefined,
  credentialId: number
): Promise<PasswordCredential> => {
  const credentials = await prisma.passwordCredential.findMany({
    where: { user_id: userId },
  });
  if (credentials.length === 0) throw new Error("No credentials found");

  const matchedCredential = credentials.find((item) => item.id === credentialId);
  if (!matchedCredential) throw new Error("No credentials found");

  return matchedCredential;
};

/**
 * @service updatePasswordCredentialService
 *
 * @description
 * Persists a specific updated PasswordCredential.
 *
 * @param {number} userId - User id
 * @param {number} credentialId - PasswordCredential id
 * @param {Record<string, unknown>} newCredentialData - PasswordCredential attributes
 *
 * @returns {PasswordCredential}
 */
export const updatePasswordCredentialService = async (
  userId: number | undefined,
  credentialId: number,
  newCredentialData: any
): Promise<PasswordCredential> => {
  const matchedCredential = await prisma.passwordCredential.findFirst({
    where: { user_id: userId, id: credentialId },
  });
  if (!matchedCredential) throw new Error("No credentials found");

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
 * @param {number} userId - User id
 * @param {number} credentialId - PasswordCredential id
 *
 * @returns {PasswordCredential}
 */
export const deletePasswordCredentialService = async (
  userId: number | undefined,
  credentialId: number
): Promise<PasswordCredential> => {
  const matchedCredential = await prisma.passwordCredential.findFirst({
    where: { user_id: userId, id: credentialId },
  });
  if (!matchedCredential) throw new Error("No credentials found");

  return prisma.passwordCredential.delete({
    where: { user_id: userId, id: credentialId },
  });
};
