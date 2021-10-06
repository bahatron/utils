export interface LogEntry {
    timestamp: string | number;
    level: string;
    id?: string;
    message?: string;
    context?: any;
}

export type LoggerEvent = "debug" | "info" | "warning" | "error";

export interface CreateLoggerOptions {
    debug?: boolean;
    pretty?: boolean;
    id?: string | (() => string);
    formatter?: (entry: LogEntry) => string;
    timestamp?: () => string | number;
}
