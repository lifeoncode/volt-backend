import {Request, Response} from "express"
import {PaymentCredential} from "../util/interface";
import logger from "../middleware/logger";
import {encryptPaymentCredential, resolveErrorType} from "../util/helper";
import {
    createPaymentCredentialService, deletePaymentCredentialService,
    getAllPaymentCredentialsService,
    getSinglePaymentCredentialService, updatePaymentCredentialService
} from "../services/paymentCredential.service";

export const createPaymentCredential = async (req: Request, res: Response) => {
    try {
        const userId: number | undefined = req.user?.userId;
        const {card_holder, card_number, card_expiry, security_code, card_type, notes}: PaymentCredential = req.body;
        if (!card_holder || !card_number || !card_expiry || !security_code || !card_type) throw new Error("missing" +
            " credentials");

        const {security_code:encryptedSecurityCode, card_number:encryptedCardNumber, card_expiry:encryptedCardExpiry} = encryptPaymentCredential({card_holder, card_number, card_expiry, security_code, card_type, notes, user:userId});

        const newPaymentCredential = await createPaymentCredentialService({card_holder, card_number:encryptedCardNumber, card_expiry:encryptedCardExpiry, security_code:encryptedSecurityCode, card_type, user:userId, notes});
        res.status(201).json(newPaymentCredential);
        logger.info(`user: ${userId} created payment credential: ${newPaymentCredential.id}`);
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            const errorType: number = resolveErrorType(err.message);
            res.status(errorType).json({message: err.message});
        }
    }
}

export const getAllPaymentCredentials = async (req: Request, res: Response) => {
    try {
        const userId: number | undefined = req.user?.userId;
        const paymentCredentials = await getAllPaymentCredentialsService(userId);
        res.status(200).json(paymentCredentials);
        logger.info(`user: ${userId} fetched all payment credentials`);
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            const errorType: number = resolveErrorType(err.message);
            res.status(errorType).json({message: err.message});
        }
    }
}

export const getSinglePaymentCredential = async (req: Request, res: Response) => {
    try {
        const userId: number | undefined = req.user?.userId;
        const {id} = req.params;
        const credential = await getSinglePaymentCredentialService(userId, Number(id));
        res.status(200).json(credential);
        logger.info(`user: ${userId} fetched single payment credential: ${credential?.id}`);
    }catch(err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            const errorType: number = resolveErrorType(err.message);
            res.status(errorType).json({message: err.message});
        }
    }
}

export const updatePaymentCredential = async (req: Request, res: Response) => {
    try {
        const userId: number | undefined = req.user?.userId;
        const {id} = req.params;
        const {card_holder, card_number, card_expiry, security_code, card_type, notes} = req.body;
        if (!card_holder && !card_number && !card_expiry && !security_code && !card_type && !notes) throw new Error("missing" +
            " credentials");

        const newCredentialData = {card_holder, card_number, card_expiry, security_code, card_type, notes};
        const updatedCredential = await updatePaymentCredentialService(userId, Number(id), newCredentialData);

        res.status(200).json(updatedCredential);
        logger.info(`user: ${userId} updated payment credential: ${updatedCredential?.id}`);
    }catch(err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            const errorType: number = resolveErrorType(err.message);
            res.status(errorType).json({message: err.message});
        }
    }
}

export const deletePaymentCredential = async (req: Request, res: Response) => {
    try {
        const userId: number | undefined = req.user?.userId;
        const {id} = req.params;
        const deletedCredential = await deletePaymentCredentialService(userId, Number(id));

        res.status(200).json(deletedCredential);
        logger.info(`user: ${userId} deleted payment credential: ${deletedCredential}`);
    }catch(err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            const errorType: number = resolveErrorType(err.message);
            res.status(errorType).json({message: err.message});
        }
    }
}