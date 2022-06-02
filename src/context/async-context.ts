const ASYNC_HOOKS = __importAsyncHooks();

function __importAsyncHooks() {
    if (typeof window !== "undefined") {
        if (process.env.NODE_ENV !== "production") {
            console.log(`[dev_warning] async context not enabled on browser`);
        }
        return;
    }
    return require("async_hooks");
}

const _store = new Map<number, Record<string, any>>();
const _hook = ASYNC_HOOKS?.createHook?.({
    init: (asyncId: number, _: any, triggerAsyncId: number) => {
        if (_store.has(triggerAsyncId)) {
            _store.set(asyncId, _store.get(triggerAsyncId)!);
        }
    },

    destroy: (asyncId: number) => {
        if (_store.has(asyncId)) {
            _store.delete(asyncId);
        }
    },
});

_hook?.enable?.();

export const AsyncContext = {
    get(key: string): any | undefined {
        if (!ASYNC_HOOKS || !_store.has(ASYNC_HOOKS.executionAsyncId())) {
            return undefined;
        }

        return _store.get(ASYNC_HOOKS.executionAsyncId())![key];
    },

    set(key: string, value: any): void {
        if (!ASYNC_HOOKS) {
            return;
        }

        let newVal = {
            ..._store.get(ASYNC_HOOKS.executionAsyncId()),
            [key]: value,
        };

        _store.set(ASYNC_HOOKS.executionAsyncId(), newVal);
    },
};
