export type Handler<T = any> = (payload: T) => void;
export type OnEventHandler<T = any> = (event: string, payload: T) => void;
export type Observable = ReturnType<typeof Observable>;

export function Observable() {
    const _handlers: Record<string, Set<Handler>> = {};
    const _globalEventHandlers: Set<OnEventHandler> = new Set();

    function getHandler(event: string) {
        if (!_handlers[event]) {
            _handlers[event] = new Set();
        }

        return _handlers[event];
    }

    return {
        emit(event: string, payload?: any): void {
            Array.from(getHandler(event)).forEach((handler) => {
                return handler(payload);
            });

            _globalEventHandlers.forEach((handler) => handler(event, payload));
        },

        on(event: string, handler: Handler): void {
            if (getHandler(event).has(handler)) return;

            getHandler(event).add(handler);
        },

        onEvent(handler: OnEventHandler): void {
            if (_globalEventHandlers.has(handler)) return;

            _globalEventHandlers.add(handler);
        },

        once(event: string, handler: Handler): void {
            let onTrigger: Handler = (payload) => {
                handler(payload);

                getHandler(event).delete(onTrigger);
            };

            getHandler(event).add(onTrigger);
        },

        off(event: string, handler: Handler): void {
            if (getHandler(event).has(handler)) {
                getHandler(event).delete(handler);
            }
        },
    } as const;
}
