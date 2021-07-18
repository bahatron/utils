import { stringify } from "../json";
import { Handler, Observable } from "../observable";

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

export interface CreateLoggerParams {
    debug?: boolean;
    pretty?: boolean;
    id?: string | (() => string);
    formatter?: (entry: LogEntry) => string;
    timestamp?: () => string | number;
}

export const ERROR_LEVEL = {
    DEBUG: "DEBUG",
    INFO: "INFO",
    WARNING: "WARNING",
    ERROR: "ERROR",
} as const;

export function Logger(options: CreateLoggerParams = {}): Logger {
    let {
        debug: _debug = true,
        id: _id,
        formatter = stringify,
        pretty: _pretty = false,
        timestamp: _timestamp = () => new Date().toISOString(),
    } = options;

    let _observable = Observable();
    let _formatter = _pretty ? prettyFormatter : formatter;

    function _log(params: {
        level: string;
        message?: string;
        context?: any;
        timestamp?: CreateLoggerParams["timestamp"];
    }): LogEntry {
        let { message, context, level } = params;
        let entry = {
            timestamp: _timestamp(),
            id: typeof _id == "function" ? _id() : _id,
            message:
                typeof context === "string" && !message ? context : message,
            context:
                typeof context === "string" && !message ? undefined : context,
            level,
        };

        let print = _formatter(entry);

        try {
            process.stdout.write(`${print}\n`);
        } catch (err) {
            console.log(print);
        }

        return entry;
    }

    return {
        on: _observable.on,

        inspect(payload) {
            if (typeof payload === "object" || Array.isArray(payload)) {
                Object.entries(Context(payload)).forEach(([key, value]) => {
                    console.log(`${_pretty ? cyan(key) : key}: `, value);
                });
            } else {
                console.log(payload);
            }
        },

        debug(payload, message) {
            if (!_debug) return;

            let entry = _log({
                level: ERROR_LEVEL.DEBUG,
                message,
                context: Context(payload),
            });

            _observable.emit("debug", entry);
        },

        info(payload, message) {
            let entry = _log({
                level: ERROR_LEVEL.INFO,
                message,
                context: Context(payload),
            });

            _observable.emit("info", entry);
        },

        warning(payload, message) {
            let entry = _log({
                level: ERROR_LEVEL.WARNING,
                message,
                context: Context(payload),
            });

            _observable.emit("warning", entry);
        },

        error(err, message) {
            let entry = _log({
                level: ERROR_LEVEL.ERROR,
                message: message ?? err?.message,
                context: Context(err),
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

    let _message = () => (message ? ` | ${message}` : ``);
    let _context = () => {
        return context ? `\n${stringify(context, undefined, 4)}` : ``;
    };

    return `${timestamp} ${_level()} ${id} ${_message()} ${_context()}`;
}

function Context(payload: any) {
    let weakSet = new WeakSet();
    function recursiveReduce(payload: any): any {
        if (payload?.isAxiosError) {
            return {
                req: {
                    headers: payload.config?.headers,
                    url: payload.config?.url,
                    method: payload.config?.method,
                    params: payload.config?.params,
                    data: payload.config?.data,
                },
                res: {
                    status: payload.response?.status,
                    data: payload.response?.data,
                },
            };
        } else if (payload instanceof Error) {
            return {
                ...payload,
                stack: payload?.stack?.split(`\n`).map((entry) => entry.trim()),
            };
        } else if (Array.isArray(payload)) {
            return payload.map(recursiveReduce);
        } else if (["object"].includes(typeof payload) && Boolean(payload)) {
            if (weakSet.has(payload)) return `[Reference]`;

            weakSet.add(payload);
            return Object.entries(payload).reduce((aggregate, [key, value]) => {
                aggregate[key] = recursiveReduce(value);
                return aggregate;
            }, {} as Record<string | number, any>);
        } else if (typeof payload === "function") {
            return `[Function: ${(payload as Function).name}]`;
        } else {
            return payload?.toString() ?? null;
        }
    }

    return recursiveReduce(payload);
}

export default Logger();
