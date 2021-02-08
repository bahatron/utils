import moment from "moment";
import { AxiosError } from "axios";

export interface LogEntry {
    timestamp: string;
    message: string;
    level: string;
    context?: any;
    id: string;
}

export interface Handler {
    (payload: LogEntry): void;
}

export interface Formatter {
    (payload: LogEntry): string;
}

export type EventType = "debug" | "info" | "warning" | "error";

export const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
export const cyan = (text: string) => `\x1b[96m${text}\x1b[0m`;
export const orange = (text: string) => `\x1b[33m${text}\x1b[0m`;
export const red = (text: string) => `\x1b[31m${text}\x1b[0m`;

const ERROR_LEVEL = {
    DEBUG: "DEBUG",
    INFO: "INFO",
    WARNING: "WARNING",
    ERROR: "ERROR",
} as const;

function stringify(payload: any): any {
    if (
        ["object", "function"].includes(typeof payload) ||
        Array.isArray(payload)
    ) {
        return JSON.stringify(payload, null, 4);
    }

    return payload;
}

function isAxiosError(err: any): err is AxiosError {
    return Boolean(err?.isAxiosError);
}

const HANDLERS: Record<string, Handler[]> = {};
async function emit(event: string, payload: LogEntry) {
    await Promise.all(
        (HANDLERS[event] || []).map((handler) => handler(payload))
    );
}

export interface Logger {
    id(id: string): Logger;
    on(event: EventType, handler: Handler): void;
    inspect(payload?: any): void;
    debug(message: string, context?: any): Promise<void>;
    info(message: string, context?: any): Promise<void>;
    warning(message: string, context?: any): Promise<void>;
    error(error: any, message?: string): Promise<void>;
}

export function createLogger({
    debug = true,
    id = "",
    formatter,
    colours = true,
}: {
    debug?: boolean;
    id?: string;
    formatter?: Formatter;
    colours?: boolean;
} = {}): Logger {
    function defaultFormatter({
        timestamp,
        message,
        level,
        id,
        context,
    }: LogEntry) {
        let _timestamp = moment(timestamp).format("YYYY-MM-DD HH:mm:ss.SSS");
        return `${_timestamp} ${level.padEnd(
            colours ? 16 : 7
        )} ${id} | ${message}${context ? `\n${stringify(context)}` : ""}`;
    }

    function log(level: string, message: string, context?: any): LogEntry {
        let payload = {
            timestamp: moment().toISOString(),
            id,
            message,
            context,
            level,
        };

        console.log(formatter?.(payload) ?? defaultFormatter(payload));

        return payload;
    }

    return {
        id(_id: string) {
            return createLogger({
                id: _id,
                debug,
                colours,
                formatter,
            });
        },

        on(event, handler) {
            if (!HANDLERS[event]) {
                HANDLERS[event] = [];
            }

            if (HANDLERS[event].includes(handler)) {
                return;
            }

            HANDLERS[event].push(handler);
        },

        inspect(payload) {
            if (typeof payload === "object" || Array.isArray(payload)) {
                Object.entries(payload).forEach(([key, value]) => {
                    console.log(`${colours ? cyan(key) : key}: `, value);
                });
            } else {
                console.log(payload);
            }
        },

        async debug(message, context) {
            if (!debug) {
                return;
            }

            let level = ERROR_LEVEL.DEBUG;

            let entry = log(
                colours ? cyan(level) : level,
                message,
                buildErrorContext(context)
            );

            return emit("debug", entry);
        },

        async info(message, context) {
            let level = ERROR_LEVEL.INFO;

            let entry = log(colours ? green(level) : level, message, context);

            return emit("info", entry);
        },

        async warning(message, context) {
            let level = ERROR_LEVEL.WARNING;

            let entry = log(colours ? orange(level) : level, message, context);

            return emit("warning", entry);
        },

        async error(err, message) {
            let level = ERROR_LEVEL.ERROR;

            let entry = log(
                colours ? red(level) : level,
                message ?? err.message ?? "",
                buildErrorContext(err)
            );

            return emit("error", entry);
        },
    };
}

function buildErrorContext(err: any) {
    if (isAxiosError(err)) {
        return {
            req_config: {
                url: err.config?.url,
                method: err.config?.method,
                headers: err.config?.headers,
                params: err.config?.params,
                data: err.config?.data,
            },
            res_status: err.response?.status,
            res_data: err.response?.data,
        };
    } else if (err instanceof Error) {
        return {
            ...err,
            stack: formatStack(err?.stack || ""),
        };
    } else {
        return err;
    }
}

function formatStack(stack: string) {
    return stack.split(`\n`).map((entry) => entry.trim());
}
