import { Request, Response } from "express";

/**
 * @middleware routeError
 *
 * @description
 * Handles invalid route requests.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object. Responds with message - route not found
 *
 * @returns {void}
 */
export const routeError = async (req: Request, res: Response): Promise<void> => {
  res.status(404).json("route not found");
};
