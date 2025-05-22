import { Request, Response } from "express";
import { PasswordCredential } from "../util/interface";
import logger from "../middleware/logger";
import {
  decryptPasswordCredential,
  encryptPasswordCredential,
  resolveErrorType,
  updateExistingCredential,
} from "../util/helper";
import {
  createPasswordCredentialService,
  deletePasswordCredentialService,
  getAllPasswordCredentialsService,
  getSinglePasswordCredentialService,
  updatePasswordCredentialService,
} from "../services/password.service";
import { getUserService } from "../services/user.service";

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
  try {
    const userId: number | undefined = req.user?.userId;
    const { service, service_user_id, password, notes }: PasswordCredential = req.body;
    if (!service || !service_user_id || !password) throw new Error("missing credentials");

    const { secret_key: secret } = await getUserService(Number(userId));
    const { service_user_id: encryptedServiceId, password: encryptedPassword } = encryptPasswordCredential(
      { service, service_user_id, password, notes, user: userId },
      secret
    );

    const newPasswordCredential = await createPasswordCredentialService({
      service,
      service_user_id: encryptedServiceId,
      password: encryptedPassword,
      user: userId,
      notes,
    });

    res.status(201).json(newPasswordCredential);
    logger.info(`user: ${req.user?.email} created a new credential: ${newPasswordCredential.id}`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      const errorType: number = resolveErrorType(err.message);
      res.status(errorType).json({ message: err.message });
    }
  }
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
    const userId: number | undefined = req.user?.userId;
    const passwordCredentials = await getAllPasswordCredentialsService(userId);

    const { secret_key: secret } = await getUserService(Number(userId));
    for (let credential of passwordCredentials) {
      decryptPasswordCredential(credential, secret);
    }

    res.status(200).json(passwordCredentials);
    logger.info(`user: ${userId} fetched all password credentials`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      const errorType: number = resolveErrorType(err.message);
      res.status(errorType).json({ message: err.message });
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
    const userId: number | undefined = req.user?.userId;
    const { id } = req.params;
    const credential = await getSinglePasswordCredentialService(Number(userId), Number(id));

    const { secret_key: secret } = await getUserService(Number(userId));
    decryptPasswordCredential(credential, secret);

    res.status(200).json(credential);
    logger.info(`user: ${userId} fetched single password credential: ${credential?.id}`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      const errorType: number = resolveErrorType(err.message);
      res.status(errorType).json({ message: err.message });
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
    const userId: number | undefined = req.user?.userId;
    const { id } = req.params;
    const { service, service_user_id, password, notes } = req.body;
    if (!service && !service_user_id && !password && !notes) throw new Error("missing credentials");

    const newCredentialData = { service, service_user_id, password, notes };

    const { secret_key: secret } = await getUserService(Number(userId));
    const existingCredential = await getSinglePasswordCredentialService(Number(userId), Number(id));

    const decryptedCredential = decryptPasswordCredential(existingCredential, secret);
    const newCredential = updateExistingCredential(newCredentialData, decryptedCredential, secret);

    const updatedCredential = await updatePasswordCredentialService(Number(userId), Number(id), newCredential);

    res.status(200).json(updatedCredential);
    logger.info(`user: ${userId} updated password credential: ${updatedCredential?.id}`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      const errorType: number = resolveErrorType(err.message);
      res.status(errorType).json({ message: err.message });
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
    const userId: number | undefined = req.user?.userId;
    const { id } = req.params;
    const deletedCredential = await deletePasswordCredentialService(Number(userId), Number(id));

    res.status(200).json(deletedCredential);
    logger.info(`user: ${userId} deleted password credential: ${deletedCredential}`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      const errorType: number = resolveErrorType(err.message);
      res.status(errorType).json({ message: err.message });
    }
  }
};
