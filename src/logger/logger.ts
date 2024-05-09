import { jsonStringify } from "../helpers/json-stringify";
import { CreateLoggerOptions, LogEntry, LoggerLevel } from "./interfaces";
import { prettyFormatter } from "./formatters";
import { ERROR_LEVEL } from "./constants";
import { LogContext } from "./context";

export type Logger = ReturnType<typeof Logger>;
export function Logger(options: CreateLoggerOptions = {}) {
    let {
        debug: _debug = true,
        id: _id,
        formatter = jsonStringify,
        pretty: _pretty = false,
    } = options;

    let _formatter = _pretty ? prettyFormatter : formatter;

    function print(params: {
        level: LoggerLevel;
        message?: string;
        context?: any;
    }): LogEntry {
        let { message, context, level } = params;
        let timestamp = new Date();

        let shouldLogContext = Boolean(
            ["string", "number"].includes(typeof context) && !message,
        );

        let entry = {
            timestamp,
            id: typeof _id == "function" ? _id() : _id,
            level,
            message: shouldLogContext ? context : message,
            context: shouldLogContext ? undefined : context,
        };

        process.stdout.write(`${_formatter(entry)}\n`);

        return entry;
    }

    return {
        debug(context: any, message?: string): void {
            if (!_debug) return;

            print({
                level: ERROR_LEVEL.DEBUG,
                message,
                context: LogContext(context),
            });
        },

        info(context: any, message?: string): void {
            print({
                level: ERROR_LEVEL.INFO,
                message,
                context: LogContext(context),
            });
        },

        warn(context: any, message?: string): void {
            print({
                level: ERROR_LEVEL.WARNING,
                message: message,
                context: LogContext(context),
            });
        },

        warning(context: any, message?: string): void {
            print({
                level: ERROR_LEVEL.WARNING,
                message: message,
                context: LogContext(context),
            });
        },

        error(err: any, message?: string): void {
            print({
                level: ERROR_LEVEL.ERROR,
                message: message ?? err?.message,
                context: LogContext(err),
            });
        },
    };
}
