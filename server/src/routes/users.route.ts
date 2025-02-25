import { Router } from "express";
import passport from "src/config/passport";
import {
  loginUserCtrl,
  registerUserCtrl,
} from "src/controllers/users.controller";
import { validateSchema } from "src/middlewares/validateSchema";
import { UserLoginSchema, UserRegisterSchema } from "src/schema/users.schema";
const router = Router();

router
  .post("/register", validateSchema(UserRegisterSchema), registerUserCtrl)
  .post("/login", validateSchema(UserLoginSchema), loginUserCtrl)
  .get(
    "/protected",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      res.json({ message: "Protected route" });
    }
  );

export default router;
