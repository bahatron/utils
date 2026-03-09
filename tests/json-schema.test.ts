import { describe, it, expect } from "vitest";
import { JsonSchema } from "../src";

describe("JsonSchema", () => {
    it("should be able to validate a schema", () => {
        let schema = JsonSchema.Object({
            name: JsonSchema.String(),
            age: JsonSchema.Number(),
        });

        expect(JsonSchema.validate({ name: "John", age: 30 }, schema)).toEqual({
            name: "John",
            age: 30,
        });

        expect(() =>
            JsonSchema.validate({ name: "John", age: "30" }, schema),
        ).toThrow();
    });
});
