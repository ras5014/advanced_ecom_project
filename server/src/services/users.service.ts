import { prisma } from "src/lib/prisma";
import bcrypt from "bcryptjs";
import { UserLogin, UserRegister } from "src/schema/users.schema";
import { generateToken } from "src/utils/generateToken";

/**
 * Registers a user in the database.
 * @throws {ErrorWithStatus} Error with HTTP status code if user already exists
 * @param {UserRegister} data User data to be registered
 * @returns {Promise<User>} Registered User
 * @route
 * @access Public
 */
export const registerUser = async (data: UserRegister) => {
  const { fullname, email, password } = data;
  // Check if user exists
  const userExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (userExists) throw { status: 409, message: "User already exists" };
  // Hash User Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  // Create User
  const user = await prisma.user.create({
    data: {
      fullname,
      email,
      password: hashedPassword,
    },
  });
};

/**
 * Logs a user in by validating their email and password.
 * @throws {ErrorWithStatus} Error with HTTP status code if user is not found or password is invalid
 * @param {UserLogin} data User data to be logged in
 * @returns {Promise<User>} Logged in User
 */
export const loginUser = async (data: UserLogin) => {
  const { email, password } = data;
  // Find user is DB by email
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) throw { status: 404, message: "User not found" };
  // Compare password
  if (user && (await bcrypt.compare(password, user.password))) {
    return {
      user,
      token: generateToken(user),
    };
  } else {
    throw { status: 401, message: "Invalid credentials" };
  }
};
