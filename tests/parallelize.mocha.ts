import { expect } from "chai";
import { parallelize } from "../src/helpers";

describe("parallelize", () => {
    it("does not modify the array given as queue", async () => {
        let queue = ["foo", "bar", "rick"];

        await parallelize({
            workers: 1,
            queue,
            handler: () => {},
        });

        expect(queue.length).to.eq(3);
    });
});
