import { ERROR_LEVEL } from "./constants";

export type LoggerEvent = "debug" | "info" | "warning" | "error";

export type LoggerLevel = keyof typeof ERROR_LEVEL;

export interface LogEntry {
    timestamp: Date;
    level: LoggerLevel;
    id?: string;
    message?: string;
    context?: any;
}

export interface CreateLoggerOptions {
    debug?: boolean;
    pretty?: boolean;
    id?: string | (() => string);
    formatter?: (entry: LogEntry) => string;
}
