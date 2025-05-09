import {Request, Response} from 'express';

export const hello = async (req: Request, res: Response) => {
    try {
        res.status(200).json({message: "There server code works"})
    } catch (err) {
        console.log("an error occurred\n", err);
    }
}