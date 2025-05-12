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
} from "../services/passwordCredential.service";
import { getUserService } from "../services/user.service";

export const createPasswordCredential = async (req: Request, res: Response) => {
  try {
    const userId: number | undefined = req.user?.userId;
    const { service, email, username, password, notes }: PasswordCredential = req.body;
    if (!service || !email || !password) throw new Error("missing credentials");

    const { secret_key: secret } = await getUserService(Number(userId));
    const { email: encryptedEmail, password: encryptedPassword } = encryptPasswordCredential(
      { service, email, username, password, notes, user: userId },
      secret
    );

    const newPasswordCredential = await createPasswordCredentialService({
      service,
      email: encryptedEmail,
      password: encryptedPassword,
      user: userId,
      username,
      notes,
    });
    res.status(201).json(newPasswordCredential);
    logger.info(`user: ${userId} created password credential: ${newPasswordCredential.id}`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      const errorType: number = resolveErrorType(err.message);
      res.status(errorType).json({ message: err.message });
    }
  }
};

export const getAllPasswordCredentials = async (req: Request, res: Response) => {
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

export const getSinglePasswordCredential = async (req: Request, res: Response) => {
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

export const updatePasswordCredential = async (req: Request, res: Response) => {
  try {
    const userId: number | undefined = req.user?.userId;
    const { id } = req.params;
    const { service, email, username, password, notes } = req.body;
    if (!service && !email && !username && !password && !notes) throw new Error("missing credentials");

    const newCredentialData = { service, email, username, password, notes };

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

export const deletePasswordCredential = async (req: Request, res: Response) => {
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
