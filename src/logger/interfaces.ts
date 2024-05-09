import { ERROR_LEVEL } from "./constants";

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
    id?: string | (() => any);
    formatter?: (entry: LogEntry) => string;
}
