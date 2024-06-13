import { stringify } from "../helpers/json-stringify";
import { LOGGER_LEVEL } from "./constants";
import { LogEntry } from "./interfaces";

export const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
export const blue = (text: string) => `\x1b[34m${text}\x1b[0m`;
export const orange = (text: string) => `\x1b[33m${text}\x1b[0m`;
export const red = (text: string) => `\x1b[31m${text}\x1b[0m`;
export const cyan = (text: string) => `\x1b[36m${text}\x1b[0m`;

const ERROR_LEVEL_COLOR = {
    [LOGGER_LEVEL.DEBUG]: blue,
    [LOGGER_LEVEL.INFO]: green,
    [LOGGER_LEVEL.WARNING]: orange,
    [LOGGER_LEVEL.ERROR]: red,
};

export function prettyFormatter(entry: LogEntry) {
    let { timestamp, message, level, id, context } = entry;

    function _level() {
        return ERROR_LEVEL_COLOR[level](level) ?? level;
    }

    let _message = () => (message ? ` ${cyan(message)}` : ``);
    let _id = () => (id ? ` (${id}):` : ``);
    let _context = () => {
        return context !== undefined
            ? `\n${
                  hasEntries(context)
                      ? stringify(context, null, 4)
                      : `    ${context}`
              }`
            : ``;
    };

    return `[${timestamp.toISOString()}] ${_level()}${_id()}${_message()}${_context()}`;
}

export function ymlFormatter(context: any, __level = 0): string {
    let indentation = () => `\n${" ".repeat((__level + 1) * 4)}`;
    let valuePrint = (val: any) => `${val}`;

    if (hasEntries(context)) {
        return Object.entries(context).reduce((carry, [key, value]) => {
            return carry.concat(
                `${indentation()}${key}: ${
                    hasEntries(value)
                        ? ymlFormatter(value, __level + 1)
                        : valuePrint(value)
                }`,
            );
        }, ``);
    }
    return `${indentation()}${valuePrint(context)}`;
}

function hasEntries(payload: any) {
    let tests = [
        (item: any) => typeof item === "object" && Boolean(item),
        (item: any) => Array.isArray(item),
    ];

    return tests.some((handler) => handler(payload));
}
