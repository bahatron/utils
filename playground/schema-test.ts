// ─── String ──────────────────────────────────────────────────────────────────

import { JsonSchema } from "../src";
import { type Static, Schema } from "../src/json-schema";

let stringType = Schema.String();
type IstringType = Static<typeof stringType>; // string

let nullableStringType = Schema.String({ nullable: true });
type InullableStringType = Static<typeof nullableStringType>; // string | null

let enumStringType = Schema.String({ enum: ["a", "b", "c"] as const }); // "a" | "b" | "c"
type IenumStringType = Static<typeof enumStringType>;

let nullableEnumStringType = Schema.String({
    enum: ["a", "b", "c"] as const,
    nullable: true,
}); // "a" | "b" | "c" | null
type InullableEnumStringType = Static<typeof nullableEnumStringType>;

let stringWithOptions = Schema.String({
    minLength: 1,
    maxLength: 255,
    pattern: "^[a-z]+$",
    description: "lowercase string",
});
type IstringWithOptions = Static<typeof stringWithOptions>;

let emailString = Schema.String({ format: "email" });

console.log({ stringWithOptions, emailString });
// ─── Number ──────────────────────────────────────────────────────────────────

let numberType = Schema.Number();
type InumberType = Static<typeof numberType>; // number

let nullableNumberType = Schema.Number({ nullable: true });
type InullableNumberType = Static<typeof nullableNumberType>; // number | null

let enumNumberType = Schema.Number({ enum: [1, 2, 3] as const });
type IenumNumberType = Static<typeof enumNumberType>; // 1 | 2 | 3

let nullableEnumNumberType = Schema.Number({
    enum: [10, 20, 30] as const,
    nullable: true,
});
type InullableEnumNumberType = Static<typeof nullableEnumNumberType>; // 10 | 20 | 30 | null

let numberWithOptions = Schema.Number({
    minimum: 0,
    maximum: 100,
    multipleOf: 5,
    description: "percentage in steps of 5",
});

// ─── Boolean ─────────────────────────────────────────────────────────────────

let booleanType = Schema.Boolean();
type IbooleanType = Static<typeof booleanType>; // boolean

let nullableBooleanType = Schema.Boolean({ nullable: true });
type InullableBooleanType = Static<typeof nullableBooleanType>; // boolean | null

let booleanWithDefault = Schema.Boolean({
    default: false,
    description: "is active",
});

// ─── Array ───────────────────────────────────────────────────────────────────

let stringArrayType = Schema.Array(Schema.String());
type IstringArrayType = Static<typeof stringArrayType>; // string[]

let nullableArrayType = Schema.Array(Schema.Number(), { nullable: true });
type InullableArrayType = Static<typeof nullableArrayType>; // number[] | null

let arrayOfNullableStrings = Schema.Array(Schema.String({ nullable: true }));
type IarrayOfNullableStrings = Static<typeof arrayOfNullableStrings>; // (string | null)[]

let arrayWithOptions = Schema.Array(Schema.String(), {
    minItems: 1,
    maxItems: 10,
    uniqueItems: true,
});

let enumArray = Schema.Array(Schema.String({ enum: ["x", "y", "z"] as const }));
type IenumArray = Static<typeof enumArray>; // ("x" | "y" | "z")[]

let nestedArray = Schema.Array(Schema.Array(Schema.Number()));
type InestedArray = Static<typeof nestedArray>; // number[][]

// ─── Object ──────────────────────────────────────────────────────────────────

let simpleObject = Schema.Object({
    name: Schema.String(),
    age: Schema.Number(),
    active: Schema.Boolean(),
});
type IsimpleObject = Static<typeof simpleObject>;
// { name: string; age: number; active: boolean }

let objectWithOptional = Schema.Object({
    id: Schema.Number(),
    name: Schema.String({ nullable: true }),
    bio: Schema.String({ optional: true }),
    nickname: Schema.String({ optional: true }),
});
type IobjectWithOptional = Static<typeof objectWithOptional>;
// { id: number; name: string; bio?: string; nickname?: string }

let nullableObject = Schema.Object(
    { id: Schema.Number(), label: Schema.String() },
    { nullable: true },
);
type InullableObject = Static<typeof nullableObject>;
// { id: number; label: string } | null

let nullableObjectWithOptional = Schema.Object(
    { id: Schema.Number(), tag: Schema.String({ optional: true }) },
    { nullable: true },
);
type InullableObjectWithOptional = Static<typeof nullableObjectWithOptional>;
// { id: number; tag?: string } | null

let objectWithDescription = Schema.Object(
    { code: Schema.String({ enum: ["A", "B"] as const }) },
    { description: "A coded object", additionalProperties: false },
);
type IobjectWithDescription = Static<typeof objectWithDescription>;
// { code: "A" | "B" }

// ─── Nested / Composed ──────────────────────────────────────────────────────

let address = Schema.Object({
    street: Schema.String(),
    city: Schema.String(),
    zip: Schema.String({ pattern: "^\\d{5}$" }),
});

let person = Schema.Object({
    name: Schema.String(),
    age: Schema.Number({ minimum: 0 }),
    email: Schema.String({ format: "email", nullable: true }),
    address: address,
    tags: Schema.Array(Schema.String(), { uniqueItems: true }),
});
type Iperson = Static<typeof person>;

let company = Schema.Object({
    name: Schema.String(),
    employees: Schema.Array(person),
    hq: address,
    industry: Schema.String({ enum: ["tech", "finance", "health"] as const }),
    notes: Schema.String({ nullable: true, optional: true }),
});
type Icompany = Static<typeof company>;

// ─── Validate ────────────────────────────────────────────────────────────────

let validPerson = Schema.validate(
    {
        name: "Rick",
        age: 70,
        email: null,
        address: { street: "123 Portal Rd", city: "C-137", zip: "12345" },
        tags: ["scientist", "genius"],
    },
    person,
);

console.log("=== String schemas ===", {
    stringType,
    nullableStringType,
    enumStringType,
    nullableEnumStringType,
    stringWithOptions,
    emailString,
});

console.log("=== Number schemas ===", {
    numberType,
    nullableNumberType,
    enumNumberType,
    nullableEnumNumberType,
    numberWithOptions,
});

console.log("=== Boolean schemas ===", {
    booleanType,
    nullableBooleanType,
    booleanWithDefault,
});

console.log("=== Array schemas ===", {
    stringArrayType,
    nullableArrayType,
    arrayOfNullableStrings,
    arrayWithOptions,
    enumArray,
    nestedArray,
});

console.log("=== Object schemas ===", {
    simpleObject,
    objectWithOptional,
    nullableObject,
    nullableObjectWithOptional,
    objectWithDescription,
});

console.log("=== Nested schemas ===", { person, company });
console.log("=== Validated person ===", validPerson);
