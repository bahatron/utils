import { AsyncContext, RunInContext } from "@bahatron/utils/lib/context";

const TEST_ID = "id";

async function async_log(id: number) {
    console.log({
        from: "async log",
        context: AsyncContext.get(TEST_ID),
        id,
    });
}

function sync_log(id: number) {
    console.log({
        from: "sync log",
        context: AsyncContext.get(TEST_ID),
        id,
    });
}

function sync_async_sync(id: number) {
    AsyncContext.set(TEST_ID, id);

    async_log(id);
    sync_log(id);
    async_log(id);
}

function return_sync_async(id: number) {
    console.log({
        from: "return sync log",
        context: AsyncContext.get(TEST_ID),
        id,
    });

    return async_log(id);
}

async function return_async_sync(id: number) {
    console.log({
        from: "return async log",
        context: AsyncContext.get(TEST_ID),
        id,
    });

    return sync_log(id);
}

Promise.all(
    Array(10)
        .fill(null)
        .map((val, index) => sync_async_sync(index)),
);

Array(10)
    .fill(null)
    .map((val, index) => {
        AsyncContext.set(TEST_ID, index);

        return return_sync_async(index);
    });

Array(10)
    .fill(null)
    .map((val, index) => {
        AsyncContext.set(TEST_ID, index);

        return return_async_sync(index);
    });

Promise.all(
    Array(10)
        .fill(null)
        .map((val, index) => {
            AsyncContext.set(TEST_ID, index);

            return return_async_sync(index);
        }),
);

Array(10)
    .fill(null)
    .map((val, index) => {
        RunInContext(
            () => {
                console.log({
                    from: "sync_run_in_context",
                    context: AsyncContext.get(TEST_ID),
                    id: index,
                });
            },
            {
                [TEST_ID]: index,
            },
        );
    });

Promise.all(
    Array(10)
        .fill(null)
        .map((val, index) => {
            RunInContext(
                async () => {
                    console.log({
                        from: "async_run_in_context",
                        context: AsyncContext.get(TEST_ID),
                        id: index,
                    });
                },
                {
                    [TEST_ID]: index,
                },
            );
        }),
);
