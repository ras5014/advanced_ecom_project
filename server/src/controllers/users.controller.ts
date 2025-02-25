import { Request, Response, NextFunction } from "express";
import { loginUser, registerUser } from "src/services/users.service";
import { successResponse } from "src/utils/responses";

const registerUserCtrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;
    const user = await registerUser(data);
    successResponse(res, user, 201, "User created successfully");
  } catch (error) {
    next(error);
  }
};
const loginUserCtrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;
    const user = await loginUser(data);
    successResponse(res, user, 200, "User logged in successfully");
  } catch (error) {
    next(error);
  }
};
export { registerUserCtrl, loginUserCtrl };
