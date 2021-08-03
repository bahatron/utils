import { expect } from "chai";
import { getenv } from "./env";

describe("getenv", () => {
    it("given 0, it'll return string '0'", () => {
        process.env.var = "0";
        (<any>process.env).bar = 0;

        expect(getenv("var")).to.equal("0");
        expect(getenv("bar")).to.equal("0");
    });

    it("given empty string, it'll return string ''", () => {
        process.env.var = "";

        expect(getenv("var")).to.equal("");
    });

    it("returns a default value if env is not set and was passed as second parameter", () => {
        delete process.env.var;

        let result = getenv("var", "default_value");

        expect(result).to.equal("default_value");
    });

    it("throws an error if key does not exist and no default value was given", () => {
        delete process.env.var;

        expect(() => getenv("var")).to.throw(Error);
    });
});
