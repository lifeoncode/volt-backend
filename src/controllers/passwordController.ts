import { Request, Response } from "express";
import { PasswordCredential } from "../util/types";
import logger from "../middleware/logger";
import {
  decryptPasswordCredential,
  encryptPasswordCredential,
  resolveErrorType,
  updateExistingCredential,
} from "../util/helper";
import {
  createPasswordCredentialService,
  deleteAllPasswordCredentialsService,
  deletePasswordCredentialService,
  getAllPasswordCredentialsService,
  getSinglePasswordCredentialService,
  updatePasswordCredentialService,
} from "../services/passwordService";
import { getUserService } from "../services/userService";
import { BadRequestError, UnprocessableEntityError } from "../middleware/errors";
const expressValidator = require("express-validator");
const { validationResult } = expressValidator;

/**
 * @controller createPasswordCredential
 *
 * @description
 * Handles the creation of a new password for the authenticated user.
 *
 * @param {Request} req - Express request object. Expects an object as Password in req.body and userId in req.user
 * @param {Response} res - Express response object. Responds with the created object or an error
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the creation of a new password credential with the userId on success. Logs the error message on failure.
 */
export const createPasswordCredential = async (req: Request, res: Response): Promise<void> => {
  const userId: string | undefined = req.user?.userId;
  if (!userId) throw new BadRequestError("User session not found");

  const { service, service_user_id, password, notes }: PasswordCredential = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array()[0];
    if (!err.value) throw new BadRequestError(err.msg);
    throw new UnprocessableEntityError(err.msg);
  }

  const { secret_key: secret } = await getUserService(userId);
  const { service_user_id: encryptedServiceId, password: encryptedPassword } = encryptPasswordCredential(
    { service, service_user_id, password, notes, user: userId },
    secret as string
  );

  const newPasswordCredential = await createPasswordCredentialService(userId, {
    service,
    service_user_id: encryptedServiceId,
    password: encryptedPassword,
    user: userId,
    notes,
  });

  res.status(201).json(newPasswordCredential);
  logger.info("new credential created");
};

/**
 * @controller getAllPasswordCredentials
 *
 * @description
 * Handles the retrieval of all password credentials for the authenticated user.
 *
 * @param {Request} req - Express request object. Expects userId in req.user
 * @param {Response} res - Express response object. Responds with all created password credentials or an error
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the retrieval of all password credentials with the userId on success. Logs the error message on failure.
 */
export const getAllPasswordCredentials = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId: string | undefined = req.user?.userId;
    if (!userId) throw new BadRequestError("User session not found");

    const passwordCredentials = await getAllPasswordCredentialsService(userId);

    const { secret_key: secret } = await getUserService(userId);
    for (let credential of passwordCredentials) {
      decryptPasswordCredential(credential, secret as string);
    }

    res.status(200).json(passwordCredentials);
    logger.info(`user: ${userId} fetched all credentials`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      const errorType: number = resolveErrorType(err.message);
      res.status(errorType).json(err.message);
    }
  }
};

/**
 * @controller getSinglePasswordCredential
 *
 * @description
 * Handles the retrieval of a specific password credential for the authenticated user.
 *
 * @param {Request} req - Express request object. Expects userId in req.user and id in req.params
 * @param {Response} res - Express response object. Responds with a single password credential or an error
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the retrieval of password credential with the userId on success. Logs the error message on failure.
 */
export const getSinglePasswordCredential = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId: string | undefined = req.user?.userId;
    if (!userId) throw new BadRequestError("User session not found");

    const { id } = req.params;
    const credential = await getSinglePasswordCredentialService(userId, id);

    const { secret_key: secret } = await getUserService(userId);
    decryptPasswordCredential(credential, secret as string);

    res.status(200).json(credential);
    logger.info(`user: ${userId} fetched single credential`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      const errorType: number = resolveErrorType(err.message);
      res.status(errorType).json(err.message);
    }
  }
};

/**
 * @controller updatePasswordCredential
 *
 * @description
 * Handles the updating of a specific password credential for the authenticated user.
 *
 * @param {Request} req - Express request object. Expects userId in req.user, id in req.params and attribute(s) that match PasswordCredential in req.body
 * @param {Response} res - Express response object. Responds with a single password credential or an error
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the updating of password credential with the userId on success. Logs the error message on failure.
 */
export const updatePasswordCredential = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId: string | undefined = req.user?.userId;
    if (!userId) throw new BadRequestError("User session not found");

    const { id } = req.params;
    const { service, service_user_id, password, notes } = req.body;
    if (!service && !service_user_id && !password && !notes) throw new BadRequestError("Missing credentials");

    const newCredentialData = { service, service_user_id, password, notes };

    const { secret_key: secret } = await getUserService(userId);
    const existingCredential = await getSinglePasswordCredentialService(userId, id);

    const decryptedCredential = decryptPasswordCredential(existingCredential, secret as string);
    const newCredential = updateExistingCredential(newCredentialData, decryptedCredential, secret as string);

    const updatedCredential = await updatePasswordCredentialService(userId, id, newCredential);

    res.status(200).json(updatedCredential);
    logger.info(`user: ${userId} updated a credential`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      const errorType: number = resolveErrorType(err.message);
      res.status(errorType).json(err.message);
    }
  }
};

/**
 * @controller deletePasswordCredential
 *
 * @description
 * Handles the deletion of a specific password credential for the authenticated user.
 *
 * @param {Request} req - Express request object. Expects userId in req.user and id in req.params
 * @param {Response} res - Express response object. Responds with a single password credential or an error
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the deletion of password credential with the userId on success. Logs the error message on failure.
 */
export const deletePasswordCredential = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId: string | undefined = req.user?.userId;
    if (!userId) throw new BadRequestError("User session not found");

    const { id } = req.params;
    const deletedCredential = await deletePasswordCredentialService(userId, id);

    res.status(200).json(deletedCredential);
    logger.info(`user: ${userId} deleted a credential`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      const errorType: number = resolveErrorType(err.message);
      res.status(errorType).json(err.message);
    }
  }
};

/**
 * @controller deleteAllPasswordCredentials
 *
 * @description
 * Handles the deletion of all password credentials for the authenticated user.
 *
 * @param {Request} req - Express request object. Expects userId in req.user
 * @param {Response} res - Express response object. Responds with a number of deleted objs or an error
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the deletion credentials with the user email on success. Logs the error message on failure.
 */
export const deleteAllPasswordCredentials = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId: string | undefined = req.user?.userId;
    if (!userId) throw new BadRequestError("User session not found");

    const data = await deleteAllPasswordCredentialsService(userId);
    res.status(200).json(data);
    logger.info(`user: ${userId} deleted all credentials`);
  } catch (err) {
    if (err instanceof Error) {
      logger.error(err.message);
      const errorType: number = resolveErrorType(err.message);
      res.status(errorType).json(err.message);
    }
  }
};
