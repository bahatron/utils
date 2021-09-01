import { parallelize } from ".";

describe("parallelize", () => {
    it("does not modify the array given as queue", async () => {
        let queue = ["foo", "bar", "rick"];

        await parallelize({
            workers: 1,
            queue,
            handler: () => {},
        });

        expect(queue.length).toBe(3);
    });
});
