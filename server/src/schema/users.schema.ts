import { z } from "zod";

export const UserSchema = z.object({
  fullname: z
    .string()
    .min(3, `Fullname must be at least 3 characters`)
    .max(30, `Fullname must be less than 30 characters`),
  email: z.string().email(`Invalid email address`),
  password: z.string().min(6, `Password must be at least 6 characters`),
  role: z.enum(["USER", "ADMIN"]),
  hasShippingAddress: z.boolean(),
});

export const UserRegisterSchema = z.object({
  fullname: UserSchema.shape.fullname,
  email: UserSchema.shape.email,
  password: UserSchema.shape.password,
});

export const UserLoginSchema = z.object({
  email: UserSchema.shape.email,
  password: UserSchema.shape.password,
});

export type User = z.infer<typeof UserSchema>;
export type UserRegister = z.infer<typeof UserRegisterSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
