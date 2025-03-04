# Setting Up Server
## 1. Installing express with TypeScript
```bash
npm i -D typescript tsx @types/express
npm i express
```
## 2. Setting up tsconfig.json
```json
{
  "compilerOptions": {
    "module": "ESNext", // Use ESNext for ESM
    "target": "ES2020", // Target modern ECMAScript versions
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "outDir": "./dist", // Output directory for compiled files
    "strict": true, // Enable strict type-checking options
    "skipLibCheck": true, // Skip type checking of declaration files
    "resolveJsonModule": true, // Include JSON imports
    "forceConsistentCasingInFileNames": true,
    "noEmit": false, // Allow emitting output
    "isolatedModules": true, // Required for using ESM modules
    "baseUrl": ".", // Allow absolute imports relative to project root
    "paths": {
      "src/*": ["./src/*"],
      "*": ["node_modules/*"]
    }
  }
}
```
## 3. Set the script inside package.json
```json
 "type": "module",
 "scripts": {
    "dev": "tsx --watch --env-file .env src/server.ts",
    "build": "tsc"
  },
```
## 4. Create the basic express server (Maintain the file structure)
- `src/server.ts`
```ts
import express from "express";

const app = express();

const PORT = process.env.PORT || 8080;
app
  .listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })
  .on("error", (err) => {
    console.error(err);
  });

```
- Add .gitignore
```
node_modules
dist
.env
```
## 5. Setup basic middlewares (cors, helmet, morgan, winston)
```bash
npm install cors helmet morgan winston 
npm i --save-dev @types/cors @types/helmet @types/morgan @types/winston
```
- Setup cors & helmet
- Setup logging with winston & morgan (setup winston inside src/utils/logger.ts)
## 6. Setup common responses inside src/utils/responses.ts
- successResponse
- errorResponse
```ts
import { Response } from "express";

export const successResponse = (
  res: Response,
  data: any,
  statusCode: number = 200,
  message: string = "Request was successful"
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  statusCode: number = 500,
  message: string = "An error occurred"
) => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};

```
## 7. Setup error handling middlewares
- errorHandler
```ts
import { errorResponse } from "../utils/responses.js";
import { NextFunction, Request, Response } from "express";
import { fromError } from "zod-validation-error";

type ErrorWithStatus = Error & { status?: number };

export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";

  // You can handle all types of errors here
  // Handle Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    return errorResponse(res, 400, "Database operation failed");
  }

  if (err.name === "PrismaClientValidationError") {
    return errorResponse(res, 400, "Invalid data provided");
  }

  // Handle Zod validation errors
  if (err.name === "ZodError") {
    const validationError = fromError(err);
    return errorResponse(
      res,
      400,
      validationError.toString() || "Validation failed"
    );
  }

  errorResponse(res, statusCode, message);
};

```
- notFoundHandler
```ts
import { errorResponse } from "../utils/responses.js";
import { Response, Request } from "express";

export const notFound = (req: Request, res: Response) => {
  return errorResponse(res, 404, "Not Found");
};

```

## 8. Final Server code (src/server.ts)
```ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import logger from "./utils/logger";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

// Default middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
const morganFormat = ":method :url :status :response-time ms";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

// Routes middlewares

// Error handling middleware
app.use(errorHandler);
// Not found middleware
app.use(notFound);

const PORT = process.env.PORT || 8080;
app
  .listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
  })
  .on("error", (err) => {
    logger.error(err.message);
  });

```
## 9. Always Keep a models, controllers, routes, services, utils folder structure
## 10. errorHandler middleware for custom errors

```ts
Global Error Handling Middleware
import { errorResponse } from "../utils/responses.js";
import { NextFunction, Request, Response } from "express";
import { fromError } from "zod-validation-error";

type ErrorWithStatus = Error & { status?: number };

export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";
  errorResponse(res, statusCode, message);
};

Setting Custom Errors
Register User Service
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
// Register User Controller
const registerUserCtrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;
    const user = await registerUser(data); // Here the error will be generated and it will go to catch error section
    successResponse(res, user, 201, "User created successfully");
  } catch (error) {
    next(error);
  }
};
```
## 11. zod schemas for validation
### 1. Prepare the schema (schema/user.schema.ts)
```ts
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

```
### 2. Use the schema in services as type
```ts
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
```
### 3. Make a validateSchema middleware
```bash
npm i zod zod-validation-error
```
- zod-validation-error is a library that helps us to get the error message from the zod schema
```ts
import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

export const validateSchema = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};

```
### 4. Use the middleware locally in routes
```ts
router
  .post("/register", validateSchema(UserRegisterSchema), registerUserCtrl)
```
### 5. Handle zod errors in errorHandling middleware
```ts
import { errorResponse } from "../utils/responses.js";
import { NextFunction, Request, Response } from "express";
import { fromError } from "zod-validation-error";

type ErrorWithStatus = Error & { status?: number };
export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";
  // Handle Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    return errorResponse(res, 400, "Database operation failed");
  }

  if (err.name === "PrismaClientValidationError") {
    return errorResponse(res, 400, "Invalid data provided");
  }

  // Handle Zod validation errors
  if (err.name === "ZodError") {
    const validationError = fromError(err);
    return errorResponse(
      res,
      400,
      validationError.toString() || "Validation failed"
    );
  }

  errorResponse(res, statusCode, message);
};

```
## 12. Authentication & Authorization
### 1. Make notes on how authentication and authorization are done (Add photos)
### 2. How to use jsonwebtoken for authentication (Token generation while login)
### 3. How to use passport for authentication