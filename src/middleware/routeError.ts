import { Request, Response } from "express";

export const routeError = async (req: Request, res: Response) => {
  res.status(404).json("route not found");
};
