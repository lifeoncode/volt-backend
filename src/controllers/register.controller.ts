import {Request, Response} from "express"
import {User} from "../util/interface";
import logger from "../middleware/logger";
import {users} from "../util/seed";
import {registerService} from "../services/register.service";

export const register = async (req: Request, res: Response) => {
    try {
        const {username, email, password} = req.body;
        if (!username || !email || !password) throw new Error("missing credentials");
        if (password.length < 8) throw new Error("invalid password length");

        const user = await registerService(username, email, password);
        res.status(201).json(user);
        logger.info(`new user registered: ${user}`);
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            if (err.message.includes('invalid') || err.message.includes('missing')) {
                res.status(400).json({error: err.message});
            } else {
                res.status(500).json({error: err.message});
            }
        }
    }
}