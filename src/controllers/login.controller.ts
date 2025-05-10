import {Request, Response} from 'express';
import logger from "../middleware/logger";
import {loginService} from "../services/login.service";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "../middleware/auth.middleware";
import {resolveErrorType} from "../util/helper";

export const login = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) throw new Error("missing credentials");

        const user = await loginService(email, password);
        const token = jwt.sign({userId: user.id, email: user.email}, JWT_SECRET, {expiresIn: "1h"});
        res.status(200).json({token});
        logger.info(`${user.email} login success`)
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            const errorType: number = resolveErrorType(err.message);
            res.status(errorType).json({message: err.message});
        }
    }
}