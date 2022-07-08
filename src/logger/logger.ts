import { stringify } from "../helpers/stringify";
import { CreateLoggerOptions, LogEntry, LoggerEvent } from "./interfaces";
import { Handler, Observable } from "../observable";
import { red, prettyFormatter, ymlFormatter } from "./formatters";
import { ERROR_LEVEL } from "./constants";
import { LogContext } from "./context";

export type Logger = ReturnType<typeof Logger>;
export function Logger(options: CreateLoggerOptions = {}) {
    let {
        debug: _debug = true,
        id: _id,
        formatter = stringify,
        pretty: _pretty = false,
    } = options;

    let _bus = Observable();
    let _formatter = _pretty ? prettyFormatter : formatter;
    let _stack: Set<Function> = new Set();

    function _log(params: {
        level: string;
        message?: string;
        context?: any;
    }): LogEntry {
        let { message, context, level } = params;
        let timestamp = new Date();

        let shouldLogContext = Boolean(
            typeof ["string", "number"].includes(typeof context) && !message,
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
        Logger,

        async flush() {
            await Promise.all(Array.from(_stack));
        },

        on(event: LoggerEvent, handler: Handler<LogEntry>) {
            let job = async (entry: LogEntry) => {
                _stack.add(job);
                await handler(entry);
                _stack.delete(job);
            };

            _bus.on(event, job);
        },

        inspect(payload: any): void {
            let print = `${red(
                `type: ${Array.isArray(payload) ? "array" : typeof payload}`,
            )}${ymlFormatter(LogContext(payload))}\n`;

            try {
                process.stdout.write(print);
            } catch (err) {
                console.log(print);
            }
        },

        debug(payload: any, message?: string): void {
            if (!_debug) return;

            let entry = _log({
                level: ERROR_LEVEL.DEBUG,
                message,
                context: LogContext(payload),
            });

            _bus.emit("debug", entry);
        },

        info(payload: any, message?: string): void {
            let entry = _log({
                level: ERROR_LEVEL.INFO,
                message,
                context: LogContext(payload),
            });

            _bus.emit("info", entry);
        },

        warning(payload: any, message?: string): void {
            let entry = _log({
                level: ERROR_LEVEL.WARNING,
                context: LogContext(payload),
                message: message ?? payload?.message,
            });

            _bus.emit("warning", entry);
        },

        error(err: any, message?: string): void {
            let entry = _log({
                level: ERROR_LEVEL.ERROR,
                message: message ?? err?.message,
                context: LogContext(err),
            });

            _bus.emit("error", entry);
        },
    };
}
