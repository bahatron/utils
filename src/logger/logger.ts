import { jsonStringify } from "../helpers/json-stringify";
import { CreateLoggerOptions, LogEntry, LoggerLevel } from "./interfaces";
import { prettyFormatter } from "./formatters";
import { LOGGER_LEVEL, LOGGER_LEVEL_VALUE } from "./constants";
import { LogContext } from "./context";

export type Logger = ReturnType<typeof Logger>;
export function Logger(options: CreateLoggerOptions = {}) {
    let {
        minLogLevel = LOGGER_LEVEL.DEBUG,
        id: _id,
        formatter,
        pretty: _pretty = false,
    } = options;

    let _minLogLevel = LOGGER_LEVEL_VALUE[minLogLevel];

    let _formatter: NonNullable<CreateLoggerOptions["formatter"]> = formatter
        ? formatter
        : _pretty
        ? prettyFormatter
        : jsonStringify;

    function print(params: {
        level: LoggerLevel;
        message?: string;
        context?: any;
    }) {
        let { message, context, level } = params;

        if (LOGGER_LEVEL_VALUE[level] < _minLogLevel) return;

        let timestamp = new Date();

        let shouldLogContext = Boolean(
            ["string", "number"].includes(typeof context) && !message,
        );

        let log = _formatter({
            timestamp,
            id: typeof _id == "function" ? _id() : _id,
            level,
            message: shouldLogContext ? context : message,
            context: shouldLogContext ? undefined : context,
        });

        try {
            process.stdout.write(`${log}\n`);
        } catch (e) {
            console.log(log);
        }
    }

    return {
        debug(context: any, message?: string): void {
            print({
                level: LOGGER_LEVEL.DEBUG,
                message,
                context: LogContext(context),
            });
        },

        info(context: any, message?: string): void {
            print({
                level: LOGGER_LEVEL.INFO,
                message,
                context: LogContext(context),
            });
        },

        warn(context: any, message?: string): void {
            print({
                level: LOGGER_LEVEL.WARNING,
                message: message,
                context: LogContext(context),
            });
        },

        warning(context: any, message?: string): void {
            print({
                level: LOGGER_LEVEL.WARNING,
                message: message,
                context: LogContext(context),
            });
        },

        error(err: any, message?: string): void {
            print({
                level: LOGGER_LEVEL.ERROR,
                message: message ?? err?.message,
                context: LogContext(err),
            });
        },
    };
}
