import {Request, Response} from 'express';
import logger from "../middleware/logger";
import {User} from "../util/interface";
import {users} from "../util/seed";

const validUser =
    (credentials: User): boolean => {
        const foundUser = users.find(user => user.email === credentials.email);
        if (!foundUser) return false
        if (foundUser) {
            if (foundUser.password !== credentials.password) return false;
            if (foundUser.password === credentials.password) return true;
        }

        return false
    }

export const login = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            throw new Error('missing credentials');
        }
        if (!validUser({email, password})) {
            throw new Error('invalid credentials');
        }
        res.status(200).json({success: `${email} logged in`});
        logger.info(`${email} logged in`)
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            if (err.message.includes('invalid') || err.message.includes('missing')) {
                res.status(400).json({error: err.message});
            } else {
                res.status(500).json({message: err.message, error: err});
            }
        }
    }
}