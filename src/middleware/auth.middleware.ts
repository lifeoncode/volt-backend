import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import {JWTPayload} from "../util/interface";

export const JWT_SECRET = process.env.JWT_SECRET!;

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({message: "Unauthorized"});
        return;
    }

    const token = authHeader?.split(" ")[1];
    try {
        req.user = jwt.verify(token, JWT_SECRET) as JWTPayload;
        next();
    } catch (err) {
        res.status(403).json({message: "invalid token"});
    }
}