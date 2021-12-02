import { stringify } from "../json";
import { ERROR_LEVEL } from "./constants";
import { LogEntry } from "./interfaces";

export const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
export const blue = (text: string) => `\x1b[34m${text}\x1b[0m`;
export const orange = (text: string) => `\x1b[33m${text}\x1b[0m`;
export const red = (text: string) => `\x1b[31m${text}\x1b[0m`;
export const cyan = (text: string) => `\x1b[36m${text}\x1b[0m`;

export function prettyFormatter({
    timestamp,
    message,
    level,
    id,
    context,
}: LogEntry) {
    function _level() {
        switch (level) {
            case ERROR_LEVEL.DEBUG:
                return blue(level);
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

    let _message = () => (message ? ` ${cyan(message)}` : ``);
    let _id = () => (id ? ` (${id}):` : ``);
    let _context = () => {
        return context !== undefined
            ? `\n${
                  hasEntries(context)
                      ? stringify(context, null, 4)
                      : `    ${context}`
              }\n`
            : ``;
    };

    return `[${timestamp}] ${_level()}${_id()}${_message()}${_context()}`;
}

export function ymlFormatter(context: any, _level = 0): string {
    function indentation() {
        return `\n${" ".repeat((_level + 1) * 4)}`;
    }
    let valuePrint = (val: any) => (typeof val === "string" ? `"${val}"` : val);
    if (hasEntries(context)) {
        return Object.entries(context).reduce((carry, [key, value]) => {
            return carry.concat(
                `${indentation()}${cyan(key)}: ${
                    hasEntries(value)
                        ? ymlFormatter(value, _level + 1)
                        : valuePrint(value)
                }`
            );
        }, ``);
    }
    return `${indentation()}${valuePrint(context)}`;
}

function hasEntries(payload: any) {
    return (
        (typeof payload === "object" && Boolean(payload)) ||
        Array.isArray(payload)
    );
}
