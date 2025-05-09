import {Request, Response} from "express";

export const recover = async (req: Request, res: Response) => {
    try {
        const {email} = req.body;
        if (!email) {
            res.status(400).json("email required");
        }
        res.status(200).json({message: `an account recovery email has been sent to ${email}`});
    } catch (err) {
        console.log(`an error occurred\n${err}`);
        res.status(400).json({message: "a server error occurred", error: err});
    }
}