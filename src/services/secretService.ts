import { PrismaClient } from "../../generated/prisma";
import { ConflictError, NotFoundError } from "../middleware/errors";
import { decryptSecret } from "../util/helper";
import { Secret } from "../util/types";
import { getUserService } from "./userService";

const prisma = new PrismaClient();

/**
 * @service createSecretService
 *
 * @description
 * Persists a new Secret in DB.
 *
 * @param {Secret} data - Secret obj
 *
 * @returns {Secret}
 */
export const createSecretService = async (userId: string, data: Secret): Promise<Secret> => {
  const { secret_key: secret } = await getUserService(userId);
  const decryptedData = decryptSecret(data, secret as string);

  const existingSecret = await prisma.secret.findFirst({
    where: { service: decryptedData.service, service_user_id: decryptedData.service_user_id },
  });
  if (existingSecret) throw new ConflictError("Secret already exists");

  const newSecret = await prisma.secret.create({
    data: {
      service: data.service,
      service_user_id: data.service_user_id,
      password: data.password,
      notes: data?.notes,
      user: { connect: { id: data.user } },
    },
  });

  return newSecret;
};

/**
 * @service getAllSecretsService
 *
 * @description
 * Queries DB for all Secret objs for a User.
 *
 * @param {string} userId - User id
 *
 * @returns {Secret[]}
 */
export const getAllSecretsService = async (userId: string | undefined): Promise<Secret[]> => {
  return prisma.secret.findMany({ where: { user_id: userId } });
};

/**
 * @service getSecretService
 *
 * @description
 * Queries DB for a specific Secret obj for a User.
 *
 * @param {string} userId - User id
 * @param {string} secretId - Secret id
 *
 * @returns {Secret}
 */
export const getSecretService = async (userId: string | undefined, secretId: string): Promise<Secret> => {
  const secrets = await prisma.secret.findMany({
    where: { user_id: userId },
  });
  if (secrets.length === 0) throw new NotFoundError("No secrets found");

  const matchedSecret = secrets.find((item) => item.id === secretId);
  if (!matchedSecret) throw new NotFoundError("No secrets found");

  return matchedSecret;
};

/**
 * @service updateSecretService
 *
 * @description
 * Persists a specific updated Secret.
 *
 * @param {string} userId - User id
 * @param {string} secretId - Secret id
 * @param {Record<string, unknown>} newSecretData - Secret attributes
 *
 * @returns {Secret}
 */
export const updateSecretService = async (
  userId: string | undefined,
  secretId: string,
  newSecretData: any
): Promise<Secret> => {
  const matchedSecret = await prisma.secret.findFirst({
    where: { user_id: userId, id: secretId },
  });
  if (!matchedSecret) throw new NotFoundError("No secrets found");

  return prisma.secret.update({
    where: { user_id: userId, id: secretId },
    data: newSecretData,
  });
};

/**
 * @service deleteSecretService
 *
 * @description
 * Deletes a specific Secret from DB.
 *
 * @param {string} userId - User id
 * @param {string} secretId - Secret id
 *
 * @returns {Secret}
 */
export const deleteSecretService = async (userId: string | undefined, secretId: string): Promise<Secret> => {
  const matchedSecret = await prisma.secret.findFirst({
    where: { user_id: userId, id: secretId },
  });
  if (!matchedSecret) throw new NotFoundError("No secrets found");

  return prisma.secret.delete({
    where: { user_id: userId, id: secretId },
  });
};

/**
 * @service deleteAllSecretsService
 *
 * @description
 * Deletes all Secrets from DB.
 *
 * @param {string} userId - User id
 *
 * @returns {Record<string, unknown>}
 */
export const deleteAllSecretsService = async (userId: string): Promise<Record<string, unknown>> => {
  const secrets = await getAllSecretsService(userId);
  if (secrets.length === 0) throw new NotFoundError("No secrets found");

  return await prisma.secret.deleteMany({ where: { user_id: userId } });
};
