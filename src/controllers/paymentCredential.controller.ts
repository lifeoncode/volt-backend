import { Request, Response } from "express";
import { PaymentCredential } from "../util/interface";
import logger from "../middleware/logger";
import {
  decryptPaymentCredential,
  encryptPaymentCredential,
  resolveErrorType,
  updateExistingCredential,
} from "../util/helper";
import {
  createPaymentCredentialService,
  deletePaymentCredentialService,
  getAllPaymentCredentialsService,
  getSinglePaymentCredentialService,
  updatePaymentCredentialService,
} from "../services/paymentCredential.service";
import { getUserService } from "../services/user.service";

/**
 * @controller createPaymentCredential
 *
 * @description
 * Handles the creation of a new payment credential for the authenticated user.
 *
 * @param {Request} req - Express request object. Expects an object as PaymentCredential in req.body and userId in req.user
 * @param {Response} res - Express response object. Responds with the created object or an error
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the creation of a new payment credential with the userId on success. Logs the error message on failure.
 */
export const createPaymentCredential = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId: number | undefined = req.user?.userId;
    const { card_holder, card_number, card_expiry, security_code, card_type, notes }: PaymentCredential = req.body;
    if (!card_holder || !card_number || !card_expiry || !security_code || !card_type)
      throw new Error("missing" + " credentials");

    const { secret_key: secret } = await getUserService(Number(userId));
    const {
      security_code: encryptedSecurityCode,
      card_number: encryptedCardNumber,
      card_expiry: encryptedCardExpiry,
    } = encryptPaymentCredential(
      { card_holder, card_number, card_expiry, security_code, card_type, notes, user: userId },
      secret
    );

    const newPaymentCredential = await createPaymentCredentialService({
      card_holder,
      card_number: encryptedCardNumber,
      card_expiry: encryptedCardExpiry,
      security_code: encryptedSecurityCode,
      card_type,
      user: userId,
      notes,
    });
    res.status(201).json(newPaymentCredential);
    logger.info(`user: ${userId} created payment credential: ${newPaymentCredential.id}`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      const errorType: number = resolveErrorType(err.message);
      res.status(errorType).json({ message: err.message });
    }
  }
};

/**
 * @controller getAllPaymentCredentials
 *
 * @description
 * Handles the retrieval of all created payment credentials for the authenticated user.
 *
 * @param {Request} req - Express request object. Expects userId in req.user
 * @param {Response} res - Express response object. Responds with all payment credentials or an error
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the retrieval of payment credentials with the userId on success. Logs the error message on failure.
 */
export const getAllPaymentCredentials = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId: number | undefined = req.user?.userId;
    const paymentCredentials = await getAllPaymentCredentialsService(userId);

    const { secret_key: secret } = await getUserService(Number(userId));
    for (let credential of paymentCredentials) {
      decryptPaymentCredential(credential, secret);
    }

    res.status(200).json(paymentCredentials);
    logger.info(`user: ${userId} fetched all payment credentials`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      const errorType: number = resolveErrorType(err.message);
      res.status(errorType).json({ message: err.message });
    }
  }
};

/**
 * @controller getSinglePaymentCredential
 *
 * @description
 * Handles the retrieval of a specific payment credential for the authenticated user.
 *
 * @param {Request} req - Express request object. Expects userId in req.user and id in req.params
 * @param {Response} res - Express response object. Responds with a single payment credential or an error
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the retrieval of payment credential with the userId on success. Logs the error message on failure.
 */
export const getSinglePaymentCredential = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId: number | undefined = req.user?.userId;
    const { id } = req.params;
    const credential = await getSinglePaymentCredentialService(Number(userId), Number(id));

    const { secret_key: secret } = await getUserService(Number(userId));
    decryptPaymentCredential(credential, secret);

    res.status(200).json(credential);
    logger.info(`user: ${userId} fetched single payment credential: ${credential?.id}`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      const errorType: number = resolveErrorType(err.message);
      res.status(errorType).json({ message: err.message });
    }
  }
};

/**
 * @controller updatePaymentCredential
 *
 * @description
 * Handles the updating of a specific payment credential for the authenticated user.
 *
 * @param {Request} req - Express request object. Expects userId in req.user, id in req.params and attribute(s) that match PaymentCredential in req.body
 * @param {Response} res - Express response object. Responds with a single payment credential or an error
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the updating of payment credential with the userId on success. Logs the error message on failure.
 */
export const updatePaymentCredential = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId: number | undefined = req.user?.userId;
    const { id } = req.params;
    const { card_holder, card_number, card_expiry, security_code, card_type, notes } = req.body;
    if (!card_holder && !card_number && !card_expiry && !security_code && !card_type && !notes)
      throw new Error("missing" + " credentials");

    const newCredentialData = { card_holder, card_number, card_expiry, security_code, card_type, notes };

    const { secret_key: secret } = await getUserService(Number(userId));
    const existingCredential = await getSinglePaymentCredentialService(Number(userId), Number(id));

    const decryptedCredential = decryptPaymentCredential(existingCredential, secret);
    const newCredential = updateExistingCredential(newCredentialData, decryptedCredential, secret);

    const updatedCredential = await updatePaymentCredentialService(Number(userId), Number(id), newCredential);

    res.status(200).json(updatedCredential);
    logger.info(`user: ${userId} updated payment credential: ${updatedCredential?.id}`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      const errorType: number = resolveErrorType(err.message);
      res.status(errorType).json({ message: err.message });
    }
  }
};

/**
 * @controller deletePaymentCredential
 *
 * @description
 * Handles the deletion of a specific payment credential for the authenticated user.
 *
 * @param {Request} req - Express request object. Expects userId in req.user and id in req.params
 * @param {Response} res - Express response object. Responds with a single payment credential or an error
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the deletion of payment credential with the userId on success. Logs the error message on failure.
 */
export const deletePaymentCredential = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId: number | undefined = req.user?.userId;
    const { id } = req.params;
    const deletedCredential = await deletePaymentCredentialService(Number(userId), Number(id));

    res.status(200).json(deletedCredential);
    logger.info(`user: ${userId} deleted payment credential: ${deletedCredential}`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      const errorType: number = resolveErrorType(err.message);
      res.status(errorType).json({ message: err.message });
    }
  }
};
