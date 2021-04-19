export async function parallelize({
    queue,
    handler,
    workers = 5,
}: {
    queue: any[];
    handler: (val: any) => void;
    workers?: number;
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
