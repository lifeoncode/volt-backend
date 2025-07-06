import { Request, Response } from "express";
import { Secret } from "../util/types";
import logger from "../middleware/logger";
import { decryptSecret, encryptSecret, resolveErrorType, updateExistingSecret } from "../util/helper";
import { getUserService } from "../services/userService";
import { BadRequestError, UnprocessableEntityError } from "../middleware/errors";
import {
  createSecretService,
  deleteAllSecretsService,
  deleteSecretService,
  getAllSecretsService,
  getSecretService,
  updateSecretService,
} from "../services/secretService";
const expressValidator = require("express-validator");
const { validationResult } = expressValidator;

/**
 * @controller createSecret
 *
 * @description
 * Handles the creation of a new secret for the authenticated user.
 *
 * @param {Request} req - Express request object. Expects an object as Secret in req.body and userId in req.user
 * @param {Response} res - Express response object. Responds with the created object or an error
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the creation of a new Secret with the userId on success. Logs the error message on failure.
 */
export const createSecret = async (req: Request, res: Response): Promise<void> => {
  const userId: string | undefined = req.user?.userId;
  if (!userId) throw new BadRequestError("User session not found");

  const { service, service_user_id, password, notes }: Secret = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array()[0];
    if (!err.value) throw new BadRequestError(err.msg);
    throw new UnprocessableEntityError(err.msg);
  }

  const { secret_key: secret } = await getUserService(userId);
  const { service_user_id: encryptedServiceId, password: encryptedPassword } = encryptSecret(
    { service, service_user_id, password, notes, user: userId },
    secret as string
  );

  const newSecret = await createSecretService(userId, {
    service,
    service_user_id: encryptedServiceId,
    password: encryptedPassword,
    user: userId,
    notes,
  });

  res.status(201).json({ message: "New secret created", data: newSecret });
  logger.info("new secret created");
};

/**
 * @controller getAllSecrets
 *
 * @description
 * Handles the retrieval of all secrets for the authenticated user.
 *
 * @param {Request} req - Express request object. Expects userId in req.user
 * @param {Response} res - Express response object. Responds with all created secrets or an error
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the retrieval of all secrets with the userId on success. Logs the error message on failure.
 */
export const getAllSecrets = async (req: Request, res: Response): Promise<void> => {
  const userId: string | undefined = req.user?.userId;
  if (!userId) throw new BadRequestError("User session not found");

  const secrets = await getAllSecretsService(userId);

  const { secret_key } = await getUserService(userId);
  for (let secret of secrets) {
    decryptSecret(secret, secret_key as string);
  }

  res.status(200).json({ message: "Successfully fetched secrets", data: secrets });
  logger.info(`user: ${userId} fetched all secrets`);
};

/**
 * @controller getSecret
 *
 * @description
 * Handles the retrieval of a specific secret for the authenticated user.
 *
 * @param {Request} req - Express request object. Expects userId in req.user and id in req.params
 * @param {Response} res - Express response object. Responds with a single secret or an error
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the retrieval of secret with the userId on success. Logs the error message on failure.
 */
export const getSecret = async (req: Request, res: Response): Promise<void> => {
  const userId: string | undefined = req.user?.userId;
  if (!userId) throw new BadRequestError("User session not found");

  const { id } = req.params;
  const secret = await getSecretService(userId, id);

  const { secret_key } = await getUserService(userId);
  decryptSecret(secret, secret_key as string);

  res.status(200).json({ message: "Successfully fetched secret", data: secret });
  logger.info(`user: ${userId} fetched a secret`);
};

/**
 * @controller updateSecret
 *
 * @description
 * Handles the updating of a specific secret for the authenticated user.
 *
 * @param {Request} req - Express request object. Expects userId in req.user, id in req.params and attribute(s) that match Secret in req.body
 * @param {Response} res - Express response object. Responds with a single secret or an error
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the updating of secret with the userId on success. Logs the error message on failure.
 */
export const updateSecret = async (req: Request, res: Response): Promise<void> => {
  const userId: string | undefined = req.user?.userId;
  if (!userId) throw new BadRequestError("User session not found");

  const { id } = req.params;
  const { service, service_user_id, password, notes } = req.body;
  if (!service && !service_user_id && !password && !notes) throw new BadRequestError("Missing credentials");

  const newSecretData = { service, service_user_id, password, notes };

  const { secret_key } = await getUserService(userId);
  const existingSecret = await getSecretService(userId, id);

  const decryptedSecret = decryptSecret(existingSecret, secret_key as string);
  const newSecret = updateExistingSecret(newSecretData, decryptedSecret, secret_key as string);

  const updatedSecret = await updateSecretService(userId, id, newSecret);

  res.status(200).json({ message: "Secret has been updated", data: updatedSecret });
  logger.info(`user: ${userId} updated a secret`);
};

/**
 * @controller deleteSecret
 *
 * @description
 * Handles the deletion of a specific secret for the authenticated user.
 *
 * @param {Request} req - Express request object. Expects userId in req.user and id in req.params
 * @param {Response} res - Express response object. Responds with a secret or an error
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the deletion of a secret with the userId on success. Logs the error message on failure.
 */
export const deleteSecret = async (req: Request, res: Response): Promise<void> => {
  const userId: string | undefined = req.user?.userId;
  if (!userId) throw new BadRequestError("User session not found");

  const { id } = req.params;
  const deletedSecret = await deleteSecretService(userId, id);

  res.status(200).json({ message: "Secret has been deleted", data: deletedSecret });
  logger.info(`user: ${userId} deleted a secret`);
};

/**
 * @controller deleteAllSecrets
 *
 * @description
 * Handles the deletion of all secrets for the authenticated user.
 *
 * @param {Request} req - Express request object. Expects userId in req.user
 * @param {Response} res - Express response object. Responds with a number of deleted objs or an error
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the deletion of secrets with the user id on success. Logs the error message on failure.
 */
export const deleteAllSecrets = async (req: Request, res: Response): Promise<void> => {
  const userId: string | undefined = req.user?.userId;
  if (!userId) throw new BadRequestError("User session not found");

  const data = await deleteAllSecretsService(userId);
  res.status(200).json({ message: "Secrets have been deleted", data });
  logger.info(`user: ${userId} deleted all secrets`);
};
