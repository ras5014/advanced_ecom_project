import jwt from "jsonwebtoken";

export const generateToken = (user: any) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign({ id: user.id, email: user.email }, secret, {
    expiresIn: "3d",
  });
};
