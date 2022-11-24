export type Handler<T = any> = (payload: T) => void;

export interface ObservableOptions {
    onEvent?: <T = any>(event: string, payload: T) => void;
}

export type Observable = ReturnType<typeof Observable>;

export function Observable({ onEvent }: ObservableOptions = {}) {
    const _handlers: Record<string, Set<Handler>> = {};

    function getHandler(event: string) {
        if (!_handlers[event]) {
            _handlers[event] = new Set();
        }

        return _handlers[event];
    }

    let observer = {
        emit(event: string, payload: any): void {
            Array.from(getHandler(event)).forEach((handler) => {
                return handler(payload);
            });

            onEvent?.(event, payload);
        },

        on(event: string, handler: Handler): void {
            if (getHandler(event).has(handler)) {
                return;
            }

            getHandler(event).add(handler);
        },

        once(event: string, handler: Handler): void {
            let onTrigger: Handler = (payload) => {
                handler(payload);
                onEvent?.(event, payload);

                getHandler(event).delete(onTrigger);
            };

            getHandler(event).add(onTrigger);
        },

        off(event: string, handler: Handler): void {
            if (getHandler(event).has(handler)) {
                getHandler(event).delete(handler);
            }

            return;
        },
    } as const;

    return observer;
}
