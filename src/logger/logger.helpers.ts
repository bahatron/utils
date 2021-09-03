import { ERROR_LEVEL } from "./logger.constants";
import { stringify } from "../json";
import { LogEntry } from "./logger.interfaces";

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
    let _context = () => {
        return context
            ? `\n${
                  ["string", "number"].includes(typeof context)
                      ? `    ${context}`
                      : stringify(context, undefined, 4).slice(2, -2)
              }`
            : ``;
    };
    let _id = () => (id ? ` ${id} |` : ` |`);
    return `[${timestamp}] ${_level()}${_id()}${_message()}${_context()}`;
}

export function LogContext(payload: any) {
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
            return payload;
        }
    }

    return recursiveReduce(payload);
}
