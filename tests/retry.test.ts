import { retry } from "../src/helpers/retry";

describe("Retry Handler", () => {
    it("returns a function", () => {
        const stringHandler = (str: string) => str;

        let stringResult = retry(stringHandler)("hello there");
    });
});
