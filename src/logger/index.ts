import { DateTime } from "luxon";
import { stringify } from "../json";
import { Handler, Observable } from "../observable";

export interface LogEntry {
    timestamp: string;
    level: string;
    id?: string;
    message?: string;
    context?: any;
}

export interface Formatter {
    (payload: LogEntry): string | object | any[];
}

export type LoggerEvent = "debug" | "info" | "warning" | "error";

export interface Logger {
    id(id: string): Logger;
    inspect(payload?: any): void;
    on(event: LoggerEvent, handler: Handler<LogEntry>): void;
    debug(payload: any, message?: string): void;
    info(payload: any, message?: string): void;
    warning(payload: any, message?: string): void;
    error(error: any, message?: string): void;
}

export interface CreateLoggerParams {
    debug?: boolean;
    id?: string | (() => string);
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

export function Logger(options: CreateLoggerParams = {}): Logger {
    let {
        debug = true,
        id: _id = "",
        formatter: _formatter,
        pretty = false,
    } = options;

    return {
        on: _observable.on,

        id(id: CreateLoggerParams["id"]) {
            return Logger({
                id,
                debug,
                pretty,
                formatter: _formatter,
            });
        },

        inspect(payload) {
            if (typeof payload === "object" || Array.isArray(payload)) {
                Object.entries(Context(payload)).forEach(([key, value]) => {
                    console.log(`${pretty ? cyan(key) : key}: `, value);
                });
            } else {
                console.log(payload);
            }
        },

        debug(payload, message) {
            if (!debug) {
                return;
            }

            let entry = _log({
                pretty,
                id: _id,
                level: ERROR_LEVEL.DEBUG,
                message,
                context: Context(payload),
                formatter: _formatter,
            });

            _observable.emit("debug", entry);
        },

        info(payload, message) {
            let entry = _log({
                pretty,
                id: _id,
                level: ERROR_LEVEL.INFO,
                message,
                context: Context(payload),
                formatter: _formatter,
            });

            _observable.emit("info", entry);
        },

        warning(payload, message) {
            let entry = _log({
                pretty,
                id: _id,
                level: ERROR_LEVEL.WARNING,
                message,
                context: Context(payload),
                formatter: _formatter,
            });

            _observable.emit("warning", entry);
        },

        error(err, message) {
            let entry = _log({
                pretty,
                id: _id,
                level: ERROR_LEVEL.ERROR,
                message: message ?? err?.message,
                context: Context(err),
                formatter: _formatter,
            });

            _observable.emit("error", entry);
        },
    };
}

export const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
export const cyan = (text: string) => `\x1b[96m${text}\x1b[0m`;
export const orange = (text: string) => `\x1b[33m${text}\x1b[0m`;
export const red = (text: string) => `\x1b[31m${text}\x1b[0m`;

function prettyFormatter({ timestamp, message, level, id, context }: LogEntry) {
    let _timestamp = DateTime.fromISO(timestamp).toFormat(
        "yyyy-LL-dd HH:mm:ss.SSS"
    );

    function _level() {
        switch (level) {
            case ERROR_LEVEL.DEBUG:
                return cyan(level);
            case ERROR_LEVEL.INFO:
                return green(level);
            case ERROR_LEVEL.WARNING:
                return orange(level);
            case ERROR_LEVEL.ERROR:
                return red(level);
            default:
                return level;
        }
    }

    function _message(): string {
        return message ? ` | ${message}` : ``;
    }

    function _context() {
        return context ? `\n${stringify(context, null, 4)}` : ``;
    }

    return `${_timestamp} ${_level()} ${id} ${_message()} ${_context()}`;
}

function _log(params: {
    id: string | (() => string);
    pretty: boolean;
    level: string;
    message?: string;
    context?: any;
    formatter?: Formatter;
}): LogEntry {
    let { id, message, context, level, pretty, formatter } = params;

    let payload = {
        timestamp: `${DateTime.utc().toISO()}`,
        id: typeof id == "function" ? id() : id,
        message: typeof context === "string" && !message ? context : message,
        context: typeof context !== "string" ? context : undefined,
        level,
    };

    console.log(
        pretty ? prettyFormatter(payload) : formatter?.(payload) ?? payload
    );

    return payload;
}

function Context(payload: any): Record<string, any> {
    if (payload?.isAxiosError) {
        return {
            req_config: {
                url: payload.config?.url,
                method: payload.config?.method,
                headers: payload.config?.headers,
                params: payload.config?.params,
                data: payload.config?.data,
            },
            res_status: payload.response?.status,
            res_data: payload.response?.data,
        };
    } else if (payload instanceof Error) {
        return {
            ...payload,
            stack: payload?.stack?.split(`\n`).map((entry) => entry.trim()),
        };
    } else if (Array.isArray(payload)) {
        return payload.map(Context);
    } else if (["object"].includes(typeof payload) && Boolean(payload)) {
        return Object.entries(payload as object).reduce(
            (aggregate, [key, value]) => {
                aggregate[key] = Context(value);

                return aggregate;
            },
            {} as Record<string | number, any>
        );
    } else {
        return payload?.toString() ?? null;
    }
}

export default Logger();
