import {Request, Response} from 'express';

export const routeError = async (req: Request, res: Response) => {
    res.status(404).json({error: "Route not found"});
}