import { Handler } from "../observable";

export interface LogEntry {
    timestamp: string | number;
    level: string;
    id?: string;
    message?: string;
    context?: any;
}

export type LoggerEvent = "debug" | "info" | "warning" | "error";

export interface Logger {
    inspect(payload?: any): void;
    on(event: LoggerEvent, handler: Handler<LogEntry>): void;
    debug(payload: any, message?: string): void;
    info(payload: any, message?: string): void;
    warning(payload: any, message?: string): void;
    error(error: any, message?: string): void;
}

export interface CreateLoggerOptions {
    debug?: boolean;
    pretty?: boolean;
    id?: string | (() => string);
    formatter?: (entry: LogEntry) => string;
    timestamp?: () => string | number;
}
