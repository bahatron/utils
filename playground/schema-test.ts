// ─── String ──────────────────────────────────────────────────────────────────

import { JsonSchema } from "../src";
import { type Static, Schema } from "../src/json-schema";
import { Logger } from "../src";
import { log } from "node:console";

let logger = Logger.Create({
    formatter: Logger.Formatters.Pretty,
});

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

logger.info({ stringWithOptions, emailString });
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

let personSchema = Schema.Object({
    name: Schema.String(),
    age: Schema.Number({ minimum: 0 }),
    email: Schema.String({ format: "email", nullable: true }),
    address: address,
    tags: Schema.Array(Schema.String(), { uniqueItems: true }),
});
type Iperson = Static<typeof personSchema>;

let company = Schema.Object({
    name: Schema.String(),
    employees: Schema.Array(personSchema),
    hq: address,
    industry: Schema.String({ enum: ["tech", "finance", "health"] as const }),
    notes: Schema.String({ nullable: true, optional: true }),
    address: Schema.Object({}),
});
type Icompany = Static<typeof company>;

let nullableArray = Schema.Array(Schema.String({ nullable: true }), {
    nullable: true,
});
type InullableArray = Static<typeof nullableArray>; // (string | null)[] | null

// ─── Array: optional & nullable ─────────────────────────────────────────────

let optionalArray = Schema.Array(Schema.String(), { optional: true });
type IoptionalArray = Static<typeof optionalArray>; // string[]

let optionalNullableArray = Schema.Array(Schema.Number(), {
    optional: true,
    nullable: true,
});
type IoptionalNullableArray = Static<typeof optionalNullableArray>; // number[] | null

// ─── Object: optional & nullable (nested) ───────────────────────────────────

let optionalObject = Schema.Object(
    { key: Schema.String() },
    { optional: true },
);
type IoptionalObject = Static<typeof optionalObject>;
// { key: string }

let optionalNullableObject = Schema.Object(
    { key: Schema.String(), value: Schema.Number({ optional: true }) },
    { optional: true, nullable: true },
);
type IoptionalNullableObject = Static<typeof optionalNullableObject>;
// { key: string; value?: number } | null

// ─── Nested optional Array & Object ─────────────────────────────────────────

let nestedOptionals = Schema.Object(
    {
        name: Schema.String(),
        aliases: Schema.Array(Schema.String(), { optional: true }),
        metadata: Schema.Object(
            {
                createdAt: Schema.String(),
                updatedAt: Schema.String({ optional: true }),
            },
            { optional: true },
        ),
        scores: Schema.Array(Schema.Number(), {
            optional: true,
            nullable: true,
        }),
        backup: Schema.Object(
            { url: Schema.String() },
            { optional: true, nullable: true },
        ),
    },
    { description: "A complex object with nested optionals", nullable: true },
);

type InestedOptionals = Static<typeof nestedOptionals>;
// {
//   name: string;
//   aliases?: string[];
//   metadata?: { createdAt: string; updatedAt?: string };
//   scores?: number[] | null;
//   backup?: { url: string } | null;
// }

// ─── Validate ────────────────────────────────────────────────────────────────

let validPerson = Schema.validate(
    {
        name: "Rick",
        age: 70,
        email: null,
        address: { street: "123 Portal Rd", city: "C-137", zip: "12345" },
        tags: ["scientist", "genius"],
    },
    personSchema,
);

logger.info(
    {
        stringType,
        nullableStringType,
        enumStringType,
        nullableEnumStringType,
        stringWithOptions,
        emailString,
    },
    "=== String schemas ===",
);

logger.info(
    {
        numberType,
        nullableNumberType,
        enumNumberType,
        nullableEnumNumberType,
        numberWithOptions,
    },
    "=== Number schemas ===",
);

logger.info(
    {
        booleanType,
        nullableBooleanType,
        booleanWithDefault,
    },
    "=== Boolean schemas ===",
);

logger.info(
    {
        stringArrayType,
        nullableArrayType,
        arrayOfNullableStrings,
        arrayWithOptions,
        enumArray,
        nestedArray,
        optionalArray,
        optionalNullableArray,
    },
    "=== Array schemas ===",
);

logger.info(
    {
        simpleObject,
        objectWithOptional,
        nullableObject,
        nullableObjectWithOptional,
        objectWithDescription,
        optionalObject,
        optionalNullableObject,
    },
    "=== Object schemas ===",
);

logger.info(
    { personSchema, company, nestedOptionals },
    "=== Nested schemas ===",
);

logger.info({ validPerson }, "=== Validated person ===");

const baseSchema = {
    type: "object",
    properties: {
        name: { type: "string" },
        age: { type: ["number", "null"] },
    },
    required: ["name", "age"],
    additionalProperties: false,
} as const;

type IBaseSchema = Static<typeof baseSchema>;
log({ baseSchema }, "=== Base schema ===");

// ─── Schema.From (no `as const` needed) ─────────────────────────────────────

const fromSchema = Schema.From({
    type: "object",
    properties: {
        name: { type: "string" },
        age: { type: "number" },
        active: { type: "boolean" },
    },
    required: ["name", "age"],
});
type IFromSchema = Static<typeof fromSchema>;
log({ fromSchema }, "=== From schema ===");
// { name: string; age: number; active?: boolean }
