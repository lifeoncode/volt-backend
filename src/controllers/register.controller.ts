import {Request, Response} from "express"
import {User} from "../util/interface";
import logger from "../middleware/logger";
import {users} from "../util/seed";

const validCredentials = (credentials: User): boolean => {
    const foundUser = users.find(user => user.email === credentials.email);
    if (foundUser) return false;
    return credentials.password.length >= 8;
}

export const register = async (req: Request, res: Response) => {
    try {
        const {username, email, password} = req.body;
        if (!username || !email || !password) {
            throw new Error("missing required credentials");
        }
        if (!validCredentials({username, email, password})) {
            throw new Error("invalid credentials");
        }
        res.status(200).json({success: `new user registered`});
        logger.info("new user registered");
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