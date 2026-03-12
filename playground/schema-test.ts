import {
    String,
    Number,
    Boolean,
    Array,
    Object,
    validate,
    type Static,
} from "../src/json-schema/schema-v2";

// ─── String ──────────────────────────────────────────────────────────────────

let stringType = String();
type IstringType = Static<typeof stringType>; // string

let nullableStringType = String({ nullable: true });
type InullableStringType = Static<typeof nullableStringType>; // string | null

type IenumStringType = Static<typeof enumStringType>;
let enumStringType = String({ enum: ["a", "b", "c"] as const }); // "a" | "b" | "c"

type InullableEnumStringType = Static<typeof nullableEnumStringType>;
let nullableEnumStringType = String({
    enum: ["a", "b", "c"] as const,
    nullable: true,
}); // "a" | "b" | "c" | null

let stringWithOptions = String({
    minLength: 1,
    maxLength: 255,
    pattern: "^[a-z]+$",
    description: "lowercase string",
});

let emailString = String({ format: "email" });

// ─── Number ──────────────────────────────────────────────────────────────────

let numberType = Number();
type InumberType = Static<typeof numberType>; // number

let nullableNumberType = Number({ nullable: true });
type InullableNumberType = Static<typeof nullableNumberType>; // number | null

let enumNumberType = Number({ enum: [1, 2, 3] as const });
type IenumNumberType = Static<typeof enumNumberType>; // 1 | 2 | 3

let nullableEnumNumberType = Number({
    enum: [10, 20, 30] as const,
    nullable: true,
});
type InullableEnumNumberType = Static<typeof nullableEnumNumberType>; // 10 | 20 | 30 | null

let numberWithOptions = Number({
    minimum: 0,
    maximum: 100,
    multipleOf: 5,
    description: "percentage in steps of 5",
});

// ─── Boolean ─────────────────────────────────────────────────────────────────

let booleanType = Boolean();
type IbooleanType = Static<typeof booleanType>; // boolean

let nullableBooleanType = Boolean({ nullable: true });
type InullableBooleanType = Static<typeof nullableBooleanType>; // boolean | null

let booleanWithDefault = Boolean({ default: false, description: "is active" });

// ─── Array ───────────────────────────────────────────────────────────────────

let stringArrayType = Array(String());
type IstringArrayType = Static<typeof stringArrayType>; // string[]

let nullableArrayType = Array(Number(), { nullable: true });
type InullableArrayType = Static<typeof nullableArrayType>; // number[] | null

let arrayOfNullableStrings = Array(String({ nullable: true }));
type IarrayOfNullableStrings = Static<typeof arrayOfNullableStrings>; // (string | null)[]

let arrayWithOptions = Array(String(), {
    minItems: 1,
    maxItems: 10,
    uniqueItems: true,
});

let enumArray = Array(String({ enum: ["x", "y", "z"] as const }));
type IenumArray = Static<typeof enumArray>; // ("x" | "y" | "z")[]

let nestedArray = Array(Array(Number()));
type InestedArray = Static<typeof nestedArray>; // number[][]

// ─── Object ──────────────────────────────────────────────────────────────────

let simpleObject = Object({
    name: String(),
    age: Number(),
    active: Boolean(),
});
type IsimpleObject = Static<typeof simpleObject>;
// { name: string; age: number; active: boolean }

let objectWithOptional = Object(
    {
        id: Number(),
        name: String(),
        bio: String(),
        nickname: String(),
    },
    { optional: ["bio", "nickname"] },
);
type IobjectWithOptional = Static<typeof objectWithOptional>;
// { id: number; name: string; bio?: string; nickname?: string }

let nullableObject = Object(
    { id: Number(), label: String() },
    { nullable: true },
);
type InullableObject = Static<typeof nullableObject>;
// { id: number; label: string } | null

let nullableObjectWithOptional = Object(
    { id: Number(), tag: String() },
    { nullable: true, optional: ["tag"] },
);
type InullableObjectWithOptional = Static<typeof nullableObjectWithOptional>;
// { id: number; tag?: string } | null

let objectWithDescription = Object(
    { code: String({ enum: ["A", "B"] as const }) },
    { description: "A coded object", additionalProperties: false },
);
type IobjectWithDescription = Static<typeof objectWithDescription>;
// { code: "A" | "B" }

// ─── Nested / Composed ──────────────────────────────────────────────────────

let address = Object({
    street: String(),
    city: String(),
    zip: String({ pattern: "^\\d{5}$" }),
});

let person = Object({
    name: String(),
    age: Number({ minimum: 0 }),
    email: String({ format: "email", nullable: true }),
    address: address,
    tags: Array(String(), { uniqueItems: true }),
});
type Iperson = Static<typeof person>;

let company = Object(
    {
        name: String(),
        employees: Array(person),
        hq: address,
        industry: String({ enum: ["tech", "finance", "health"] as const }),
        notes: String({ nullable: true }),
    },
    { optional: ["notes"] },
);
type Icompany = Static<typeof company>;

// ─── Validate ────────────────────────────────────────────────────────────────

let validPerson = validate(
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
