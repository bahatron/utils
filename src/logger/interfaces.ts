import { LOGGER_LEVEL } from "./constants";

export type LoggerLevel = keyof typeof LOGGER_LEVEL;

export interface LogEntry {
    timestamp: Date;
    level: LoggerLevel;
    id?: string;
    message?: string;
    context?: any;
}

export interface CreateLoggerOptions {
    /**@description uses a formatter optimised for development experience, if a customer formatter is supplied, this flag gets overwritten */
    pretty?: boolean;
    /** @description a function can be supplied to capture async context and have a dynamic logger tracing */
    id?: string | (() => string);
    /** @description the output of this function will be printed to std.output. defaults to single line json object */
    formatter?: (entry: LogEntry) => string;
    /** @description min logger level, defaults to DEBUG (all logs) */
    minLogLevel?: LoggerLevel;
}
