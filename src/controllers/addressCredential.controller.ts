import {Request, RequestHandler, Response} from 'express';
import logger from "../middleware/logger";
import {resolveErrorType} from "../util/helper";
import {createAddressCredentialService} from "../services/addressCredential.service";
import {AddressCredential} from "../util/interface";

export const createAddressCredential: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId:number|undefined = req.user?.userId;
        const {label, city, street, state, zip_code, town}:AddressCredential = req.body;
        if (!label || !city || !street || !state || !zip_code) throw new Error("missing credentials");

        const newAddressCredential = await createAddressCredentialService({label, city, street, state, town, user:userId, zip_code});
        res.status(201).json(newAddressCredential);
        logger.info(`new address credential: ${newAddressCredential.id}`);
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            const errorType: number = resolveErrorType(err.message);
            res.status(errorType).json({message: err.message});
        }
    }
}


export const getAllAddressCredentials = async (req: Request, res: Response) => {
}

export const getSingleAddressCredential = async (req: Request, res: Response) => {
}

export const updateAddressCredential = async (req: Request, res: Response) => {
}

export const deleteAddressCredential = async (req: Request, res: Response) => {
}

