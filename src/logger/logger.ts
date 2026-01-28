import { jsonStringify } from "../helpers/json-stringify";
import { LogContext } from "./context";
import { Handler, Observable } from "../observable";
import { PrettyFormatter } from "./formatters";

export type LoggerLevel = keyof typeof LoggerLevel;
export const LoggerLevel = {
    DEBUG: "DEBUG",
    INFO: "INFO",
    WARNING: "WARNING",
    ERROR: "ERROR",
} as const;

const LoggerLevelValue: Record<keyof typeof LoggerLevel, number> = {
    [LoggerLevel.DEBUG]: 0,
    [LoggerLevel.INFO]: 1,
    [LoggerLevel.WARNING]: 2,
    [LoggerLevel.ERROR]: 3,
};

export interface LogEntry {
    timestamp: Date;
    level: LoggerLevel;
    id?: string;
    message?: string;
    context?: any;
}

export interface CreateLoggerOptions {
    /** @description a function can be supplied to capture async context and have a dynamic logger tracing */
    id?: string | (() => string);
    /** @description the output of this function will be printed. defaults to single line json object */
    formatter?: (entry: LogEntry) => string | object;
    /** @description min logger level, defaults to DEBUG (all logs) */
    minLogLevel?: LoggerLevel;
}

export type Logger = ReturnType<typeof Logger>;
export default function Logger(options: CreateLoggerOptions = {}) {
    let { minLogLevel = LoggerLevel.DEBUG, id: _id, formatter } = options;

    let _minLogLevel = LoggerLevelValue[minLogLevel];

    let _bus = Observable();
    let _stack: Set<Function> = new Set();

    let _formatter: NonNullable<CreateLoggerOptions["formatter"]> = formatter
        ? formatter
        : jsonStringify;

    function _print(params: {
        level: LoggerLevel;
        message?: string;
        context?: any;
    }) {
        let { message, context, level } = params;

        if (LoggerLevelValue[level] < _minLogLevel) return;

        let timestamp = new Date();

        let shouldLogContext = Boolean(
            ["string", "number"].includes(typeof context) && !message,
        );

        let entry: LogEntry = {
            timestamp,
            id: typeof _id == "function" ? _id() : _id,
            level,
            message: shouldLogContext ? context : message,
            context: shouldLogContext ? undefined : context,
        };

        let log = _formatter(entry);

        try {
            typeof log === "string"
                ? process.stdout.write(`${log}\n`)
                : console.log(log);
        } catch (e) {
            console.log(log);
        }

        return entry;
    }

    return {
        async flush() {
            await Promise.all(Array.from(_stack));
            _stack.clear();
        },

        on(event: LoggerLevel, handler: Handler<LogEntry>) {
            let job = async (entry: LogEntry) => {
                _stack.add(job);
                await handler(entry);
                _stack.delete(job);
            };

            _bus.on(event, job);
            return job;
        },

        off(event: LoggerLevel, job: (entry: LogEntry) => Promise<void>) {
            _bus.off(event, job);
        },

        debug(context: any, message?: string): void {
            _bus.emit(
                LoggerLevel.DEBUG,
                _print({
                    level: LoggerLevel.DEBUG,
                    message,
                    context: LogContext(context),
                }),
            );
        },

        info(context: any, message?: string): void {
            _bus.emit(
                LoggerLevel.INFO,
                _print({
                    level: LoggerLevel.INFO,
                    message,
                    context: LogContext(context),
                }),
            );
        },

        warn(context: any, message?: string): void {
            _bus.emit(
                LoggerLevel.WARNING,
                _print({
                    level: LoggerLevel.WARNING,
                    message: message,
                    context: LogContext(context),
                }),
            );
        },

        /**
         * @deprecated use warn instead
         */
        warning(context: any, message?: string): void {
            _bus.emit(
                LoggerLevel.WARNING,
                _print({
                    level: LoggerLevel.WARNING,
                    message: message,
                    context: LogContext(context),
                }),
            );
        },

        error(err: any, message?: string): void {
            _bus.emit(
                LoggerLevel.ERROR,
                _print({
                    level: LoggerLevel.ERROR,
                    message: message ?? err?.message,
                    context: LogContext(err),
                }),
            );
        },
    };
}
