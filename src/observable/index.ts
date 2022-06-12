export type Handler<T> = (payload: T) => void;

export type Observable = ReturnType<typeof Observable>;
export function Observable<E extends string, T = any>() {
    const _handlers: Record<string, Set<Handler<T>>> = {};

    function getHandler(event: E) {
        if (!_handlers[event]) {
            _handlers[event] = new Set();
        }

        return _handlers[event];
    }

    let observer = {
        emit(event: E, payload: T): void {
            Array.from(getHandler(event)).map((handler) => {
                return handler(payload);
            });
        },

        on(event: E, handler: Handler<T>): void {
            if (getHandler(event).has(handler)) {
                return;
            }

            getHandler(event).add(handler);
        },

        once(event: E, handler: Handler<T>): void {
            let onTrigger: Handler<T> = async (payload) => {
                await handler(payload);

                getHandler(event).delete(onTrigger);
            };

            getHandler(event).add(onTrigger);
        },

        off(event: E, handler: Handler<T>): void {
            if (getHandler(event).has(handler)) {
                getHandler(event).delete(handler);
            }

            return;
        },
    } as const;

    return observer;
}
