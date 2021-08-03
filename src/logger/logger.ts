import { stringify } from "../json";
import { CreateLoggerOptions, Logger, LogEntry } from "./logger.interfaces";
import { Observable } from "../observable";
import { Context, cyan, prettyFormatter } from "./logger.helpers";
import { ERROR_LEVEL } from "./logger.constants";

export function Logger(options: CreateLoggerOptions = {}): Logger {
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
        timestamp?: CreateLoggerOptions["timestamp"];
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
