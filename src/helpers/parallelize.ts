export async function parallelize<T = any>({
    queue,
    handler,
    workers,
}: {
    queue: T[];
    handler: (val: T) => void;
    workers: number;
}) {
    let _queue = Array.from(queue);

    await Promise.all(
        Array(workers)
            .fill(undefined)
            .map(async () => {
                let item;

                while ((item = _queue.pop())) {
                    await handler(item);
                }
            })
    );
}
