import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import logger from "./utils/logger";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";
import { limiter } from "./middlewares/limiter";

// Import Routes
import usersRoute from "./routes/users.route";

const app = express();

// Default middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

// Rate limiter middleware
app.use(limiter);

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
app.use("/api/v1", usersRoute);

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
