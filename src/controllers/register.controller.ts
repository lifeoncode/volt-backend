import {Request, Response} from "express"
import logger from "../middleware/logger";
import {registerService} from "../services/register.service";
import {generateSecretKey, resolveErrorType} from "../util/helper";

export const register = async (req: Request, res: Response) => {
    try {
        const {username, email, password} = req.body;
        if (!username || !email || !password) throw new Error("missing credentials");
        if (password.length < 8) throw new Error("invalid password length");

        const secret = generateSecretKey();
        const user = await registerService(username, email, password, secret);

        res.status(201).json(user);
        logger.info(`new user registered: ${user.email}`);
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            const errorType: number = resolveErrorType(err.message);
            res.status(errorType).json({message: err.message});
        }
    }
}