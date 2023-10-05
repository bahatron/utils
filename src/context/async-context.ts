import ASYNC_HOOKS from "async_hooks";

// const ASYNC_HOOKS = __importAsyncHooks();
// function __importAsyncHooks() {
//     if (typeof window !== "undefined") {
//         console.log(`[WARNING] async context not enabled on browser`);
//         return;
//     }
//     return require("async_hooks");
// }

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

const execContext = () => {
    return ASYNC_HOOKS.executionAsyncId() || ASYNC_HOOKS.triggerAsyncId();
};

export const AsyncContext = {
    get(key: string): any | undefined {
        if (!ASYNC_HOOKS || !_store.has(execContext())) {
            return undefined;
        }

        return _store.get(execContext())![key];
    },

    getAll() {
        return _store.get(execContext())!;
    },

    set(key: string, value: any): void {
        let newVal = {
            ..._store.get(execContext()),
            [key]: value,
        };

        _store.set(execContext(), newVal);
    },
};
