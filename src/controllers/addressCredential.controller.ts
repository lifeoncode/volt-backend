import {Request, RequestHandler, Response} from 'express';
import logger from "../middleware/logger";
import {resolveErrorType} from "../util/helper";
import {
    createAddressCredentialService, deleteAddressCredentialService,
    getAllAddressCredentialsService,
    getSingleAddressCredentialsService, updateAddressCredentialService
} from "../services/addressCredential.service";
import {AddressCredential} from "../util/interface";

export const createAddressCredential: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId:number|undefined = req.user?.userId;
        const {label, city, street, state, zip_code, town}:AddressCredential = req.body;
        if (!label || !city || !street || !state || !zip_code) throw new Error("missing credentials");

        const newAddressCredential = await createAddressCredentialService({label, city, street, state, town, user:userId, zip_code});
        res.status(201).json(newAddressCredential);
        logger.info(`user: ${userId} created address credential: ${newAddressCredential.id}`);
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            const errorType: number = resolveErrorType(err.message);
            res.status(errorType).json({message: err.message});
        }
    }
}

export const getAllAddressCredentials: RequestHandler = async (req: Request, res: Response):Promise<void> => {
    try {
        const userId:number|undefined = req.user?.userId;
     const addressCredentials = await getAllAddressCredentialsService(userId);
     res.status(200).json(addressCredentials);
     logger.info(`user: ${userId} fetched all address credentials`);
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            const errorType: number = resolveErrorType(err.message);
            res.status(errorType).json({message: err.message});
        }
    }
}

export const getSingleAddressCredential: RequestHandler = async (req: Request, res: Response):Promise<void> => {
    try {
        const userId: number | undefined = req.user?.userId;
        const {id} = req.params;
        const credential = await getSingleAddressCredentialsService(userId, Number(id));
        res.status(200).json(credential);
        logger.info(`user: ${userId} fetched single address credential: ${credential?.id}`);
    }catch(err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            const errorType: number = resolveErrorType(err.message);
            res.status(errorType).json({message: err.message});
        }
    }
}

export const updateAddressCredential:RequestHandler = async (req: Request, res: Response):Promise<void> => {
    try {
        const userId: number | undefined = req.user?.userId;
        const {id} = req.params;
        const {label, city, street, state, zip_code, town} = req.body;
        if (!label && !city && !street && !state && !zip_code && !town) throw new Error("missing credentials");

        const newCredentialData = {label, city, street, state, zip_code, town};
        const updatedCredential = await updateAddressCredentialService(userId, Number(id), newCredentialData);

        res.status(200).json(updatedCredential);
        logger.info(`user: ${userId} updated address credential: ${updatedCredential?.id}`);
    }catch(err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            const errorType: number = resolveErrorType(err.message);
            res.status(errorType).json({message: err.message});
        }
    }
}

export const deleteAddressCredential: RequestHandler = async (req: Request, res: Response):Promise<void> => {
    try {
        const userId: number | undefined = req.user?.userId;
        const {id} = req.params;
        const deletedCredential = await deleteAddressCredentialService(userId, Number(id));

        res.status(200).json(deletedCredential);
        logger.info(`user: ${userId} deleted address credential: ${deletedCredential}`);
    }catch(err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            const errorType: number = resolveErrorType(err.message);
            res.status(errorType).json({message: err.message});
        }
    }
}
