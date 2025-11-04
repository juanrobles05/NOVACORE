import pino, { LoggerOptions } from "pino";
import { config } from "../../core/config/env";


const isDevelopment = config.nodeEnv !== "production";

const loggerOptions: LoggerOptions = {
  level: isDevelopment ? 'debug' : 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss Z',
          ignore: 'pid,hostname',
          ignoreTrailingSlash: true,
        },
      }
    : undefined,
};

export const logger = pino(loggerOptions);
export const loggerOpts = loggerOptions;