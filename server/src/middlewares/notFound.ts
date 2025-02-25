import { errorResponse } from "../utils/responses.js";
import { Response, Request } from "express";

export const notFound = (req: Request, res: Response) => {
  return errorResponse(res, 404, "Not Found");
};
