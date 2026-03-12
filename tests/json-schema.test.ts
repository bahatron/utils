import { describe, it, expect, expectTypeOf } from "vitest";
import * as Schema from "../src/json-schema/schema-v2";
import type { Static } from "../src/json-schema/schema-v2";

describe("JsonSchema", () => {
    it("should be able to validate a schema", () => {
        let schema = Schema.Object({
            name: Schema.String(),
            age: Schema.Number(),
        });

        expect(Schema.validate({ name: "John", age: 30 }, schema)).toEqual({
            name: "John",
            age: 30,
        });

        expect(() =>
            Schema.validate({ name: "John", age: "30" }, schema),
        ).toThrow();
    });

    describe("primitive builders", () => {
        it("String() produces correct schema", () => {
            let schema = Schema.String({ minLength: 1 });
            expect(schema).toEqual({ type: "string", minLength: 1 });
        });

        it("Number() produces correct schema", () => {
            let schema = Schema.Number({ minimum: 0 });
            expect(schema).toEqual({ type: "number", minimum: 0 });
        });

        it("Boolean() produces correct schema", () => {
            let schema = Schema.Boolean();
            expect(schema).toEqual({ type: "boolean" });
        });
    });

    describe("nullable", () => {
        it("String({ nullable: true }) produces nullable type", () => {
            let schema = Schema.String({ nullable: true });
            expect(schema).toEqual({ type: ["string", "null"] });
        });

        it("Number({ nullable: true }) produces nullable type", () => {
            let schema = Schema.Number({ nullable: true });
            expect(schema).toEqual({ type: ["number", "null"] });
        });

        it("Boolean({ nullable: true }) produces nullable type", () => {
            let schema = Schema.Boolean({ nullable: true });
            expect(schema).toEqual({ type: ["boolean", "null"] });
        });
    });

    describe("enum", () => {
        it("String({ enum }) narrows to enum values", () => {
            let schema = Schema.String({
                enum: ["a", "b", "c"] as const,
            });
            expect(schema).toEqual({
                type: "string",
                enum: ["a", "b", "c"],
            });
            type Result = Static<typeof schema>;
            expectTypeOf<Result>().toEqualTypeOf<"a" | "b" | "c">();
        });

        it("Number({ enum }) narrows to enum values", () => {
            let schema = Schema.Number({ enum: [1, 2, 3] as const });
            expect(schema).toEqual({ type: "number", enum: [1, 2, 3] });
            type Result = Static<typeof schema>;
            expectTypeOf<Result>().toEqualTypeOf<1 | 2 | 3>();
        });

        it("String({ enum, nullable }) produces enum | null", () => {
            let schema = Schema.String({
                enum: ["x", "y"] as const,
                nullable: true,
            });
            expect(schema).toEqual({
                type: ["string", "null"],
                enum: ["x", "y"],
            });
            type Result = Static<typeof schema>;
            expectTypeOf<Result>().toEqualTypeOf<"x" | "y" | null>();
        });
    });

    describe("Array builder", () => {
        it("Array(items) produces correct schema", () => {
            let schema = Schema.Array(Schema.String());
            expect(schema).toEqual({
                type: "array",
                items: { type: "string" },
            });
        });

        it("Array(items, { nullable: true }) is nullable", () => {
            let schema = Schema.Array(Schema.Number(), {
                nullable: true,
            });
            expect(schema).toEqual({
                type: ["array", "null"],
                items: { type: "number" },
            });
        });
    });

    describe("Object builder", () => {
        it("Object(props) makes all keys required", () => {
            let schema = Schema.Object({
                name: Schema.String(),
                age: Schema.Number(),
            });
            expect(schema).toEqual({
                type: "object",
                properties: {
                    name: { type: "string" },
                    age: { type: "number" },
                },
                required: ["name", "age"],
            });
        });

        it("Object(props, { optional }) excludes keys from required", () => {
            let schema = Schema.Object(
                {
                    name: Schema.String(),
                    nickname: Schema.String(),
                },
                { optional: ["nickname"] },
            );
            expect(schema).toEqual({
                type: "object",
                properties: {
                    name: { type: "string" },
                    nickname: { type: "string" },
                },
                required: ["name"],
            });
        });

        it("Object(props, { nullable: true }) is nullable", () => {
            let schema = Schema.Object(
                { id: Schema.Number() },
                { nullable: true },
            );
            expect(schema).toEqual({
                type: ["object", "null"],
                properties: { id: { type: "number" } },
                required: ["id"],
            });
        });
    });

    describe("Static type inference", () => {
        it("infers correct type for Object with required + optional", () => {
            let schema = Schema.Object(
                {
                    name: Schema.String(),
                    age: Schema.Number(),
                    bio: Schema.String(),
                },
                { optional: ["bio"] },
            );
            type Result = Static<typeof schema>;
            expectTypeOf<Result>().toEqualTypeOf<{
                name: string;
                age: number;
                bio?: string;
            }>();
        });

        it("infers correct type for basic Object", () => {
            let schema = Schema.Object({
                name: Schema.String(),
                age: Schema.Number(),
            });
            type Result = Static<typeof schema>;
            expectTypeOf<Result>().toEqualTypeOf<{
                name: string;
                age: number;
            }>();
        });
    });
});
