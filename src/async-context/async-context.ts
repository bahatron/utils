// import asyncHooks from "async_hooks";
let asyncHooks: any;

function __importAsyncHooks() {
    try {
        asyncHooks = require("async_hooks");
    } catch (err) {
        if (process.env.NODE_ENV !== "production") {
            console.log(`async hooks not enabled on browser`);
        }
    }
}
__importAsyncHooks();

const store = new Map<number, Record<string, any>>();
const _hook = asyncHooks?.createHook({
    init: (asyncId: number, _: any, triggerAsyncId: number) => {
        if (store.has(triggerAsyncId)) {
            store.set(asyncId, store.get(triggerAsyncId)!);
        }
    },

    destroy: (asyncId: number) => {
        if (store.has(asyncId)) {
            store.delete(asyncId);
        }
    },
});

_hook?.enable();

export const AsyncContext = {
    get(key: string): any | undefined {
        if (!asyncHooks || !store.has(asyncHooks.executionAsyncId())) {
            return undefined;
        }

        return store.get(asyncHooks.executionAsyncId())![key];
    },

    set(key: string, value: any): void {
        if (!asyncHooks) {
            return;
        }

        let newVal = {
            ...store.get(asyncHooks.executionAsyncId()),
            [key]: value,
        };

        store.set(asyncHooks.executionAsyncId(), newVal);
    },
};
