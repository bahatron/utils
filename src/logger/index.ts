import { DateTime } from "luxon";
import { $json } from "..";
import { Handler, Observable } from "../observable";

export interface LogEntry {
    timestamp: string;
    level: string;
    id?: string;
    message?: string;
    context?: any;
}

export interface Formatter {
    (payload: LogEntry): string;
}

export type EventType = "debug" | "info" | "warning" | "error";

export interface Logger {
    id(id: string): Logger;
    formatter(formatter: Formatter): Logger;
    inspect(payload?: any): void;
    on(event: EventType, handler: Handler<LogEntry>): void;
    debug(payload: any, message?: string): Promise<void>;
    info(payload: any, message?: string): Promise<void>;
    warning(payload: any, message?: string): Promise<void>;
    error(error: any, message?: string): Promise<void>;
}

export interface CreateLoggerParams {
    debug?: boolean;
    id?: string;
    formatter?: Formatter;
    pretty?: boolean;
}

export const ERROR_LEVEL = {
    DEBUG: "DEBUG",
    INFO: "INFO",
    WARNING: "WARNING",
    ERROR: "ERROR",
} as const;

const _observable = Observable();

export function Logger(params: CreateLoggerParams = {}): Logger {
    let {
        debug = true,
        id: _id = "",
        formatter: _formatter,
        pretty = true,
    } = params;

    return {
        on: _observable.on,

        id(id: string) {
            return Logger({
                id,
                debug,
                pretty,
                formatter: _formatter,
            });
        },

        formatter(formatter: Formatter) {
            return Logger({
                formatter,
                id: _id,
                debug,
                pretty,
            });
        },

        inspect(payload) {
            if (typeof payload === "object" || Array.isArray(payload)) {
                Object.entries(payload).forEach(([key, value]) => {
                    console.log(`${pretty ? cyan(key) : key}: `, value);
                });
            } else {
                console.log(payload);
            }
        },

        async debug(payload, message) {
            if (!debug) {
                return;
            }

            let entry = log({
                pretty,
                id: _id,
                level: ERROR_LEVEL.DEBUG,
                message,
                context: Context(payload),
                formatter: _formatter,
            });

            return _observable.emit("debug", entry);
        },

        async info(payload, message) {
            let entry = log({
                pretty,
                id: _id,
                level: ERROR_LEVEL.INFO,
                message,
                context: Context(payload),
                formatter: _formatter,
            });

            return _observable.emit("info", entry);
        },

        async warning(payload, message) {
            let entry = log({
                pretty,
                id: _id,
                level: ERROR_LEVEL.WARNING,
                message,
                context: Context(payload),
                formatter: _formatter,
            });

            return _observable.emit("warning", entry);
        },

        async error(err, message) {
            let entry = log({
                pretty,
                id: _id,
                level: ERROR_LEVEL.ERROR,
                message,
                context: Context(err),
                formatter: _formatter,
            });

            return _observable.emit("error", entry);
        },
    };
}

export const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
export const cyan = (text: string) => `\x1b[96m${text}\x1b[0m`;
export const orange = (text: string) => `\x1b[33m${text}\x1b[0m`;
export const red = (text: string) => `\x1b[31m${text}\x1b[0m`;

function defaultFormatter({
    timestamp,
    message,
    level,
    id,
    context,
}: LogEntry) {
    let _timestamp = DateTime.fromISO(timestamp).toFormat(
        "yyyy-LL-dd HH:mm:ss.SSS"
    );

    return `${_timestamp} ${level} ${id} ${message ? ` | ${message}\n` : ``}${
        context ? `${$json.stringify(context)}` : ""
    }`;
}

function log(params: {
    id: string;
    pretty: boolean;
    level: string;
    message?: string;
    context?: any;
    formatter?: Formatter;
}): LogEntry {
    let { id, message, context, level, pretty } = params;

    let formatter = pretty
        ? defaultFormatter
        : params.formatter ?? defaultFormatter;

    let payload = {
        timestamp: DateTime.utc().toISO(),
        id,
        message: typeof context === "string" ? context : message,
        context: ["string"].includes(typeof context) ? undefined : context,
        level,
    };

    console.log(formatter(payload));

    return payload;
}

function Context(err: any) {
    if (err?.isAxiosError) {
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
            stack: err?.stack?.split(`\n`).map((entry) => entry.trim()),
        };
    } else {
        return err;
    }
}
