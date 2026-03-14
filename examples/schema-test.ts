// ─── String ──────────────────────────────────────────────────────────────────

import { type Static, Schema } from "../src/json-schema";
import { Logger } from "../src";
import { Formatters } from "../src/logger";

let logger = Logger.Logger({
    formatter: Formatters.Pretty,
});

let stringType = Schema.String();
type IstringType = Static<typeof stringType>; // string

let nullableStringType = Schema.Nullable(Schema.String());
type InullableStringType = Static<typeof nullableStringType>; // string | null

let enumStringType = Schema.String({ enum: ["a", "b", "c"] as const }); // "a" | "b" | "c"
type IenumStringType = Static<typeof enumStringType>;

let nullableEnumStringType = Schema.Nullable(
    Schema.String({ enum: ["a", "b", "c"] as const }),
); // "a" | "b" | "c" | null
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

let nullableNumberType = Schema.Nullable(Schema.Number());
type InullableNumberType = Static<typeof nullableNumberType>; // number | null

let enumNumberType = Schema.Number({ enum: [1, 2, 3] as const });
type IenumNumberType = Static<typeof enumNumberType>; // 1 | 2 | 3

let nullableEnumNumberType = Schema.Nullable(
    Schema.Number({ enum: [10, 20, 30] as const }),
);
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

let nullableBooleanType = Schema.Nullable(Schema.Boolean());
type InullableBooleanType = Static<typeof nullableBooleanType>; // boolean | null

let booleanWithDefault = Schema.Boolean({
    default: false,
    description: "is active",
});

// ─── Array ───────────────────────────────────────────────────────────────────

let stringArrayType = Schema.Array(Schema.String());
type IstringArrayType = Static<typeof stringArrayType>; // string[]

let nullableArrayType = Schema.Nullable(Schema.Array(Schema.Number()));
type InullableArrayType = Static<typeof nullableArrayType>; // number[] | null

let arrayOfNullableStrings = Schema.Array(Schema.Nullable(Schema.String()));
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
    name: Schema.Nullable(Schema.String()),
    bio: Schema.Optional(Schema.String()),
    nickname: Schema.Optional(Schema.String()),
});
type IobjectWithOptional = Static<typeof objectWithOptional>;
// { id: number; name: string; bio?: string; nickname?: string }

let nullableObject = Schema.Nullable(
    Schema.Object({ id: Schema.Number(), label: Schema.String() }),
);
type InullableObject = Static<typeof nullableObject>;
// { id: number; label: string } | null

let nullableObjectWithOptional = Schema.Nullable(
    Schema.Object({
        id: Schema.Number(),
        tag: Schema.Optional(Schema.String()),
    }),
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
    email: Schema.Nullable(Schema.String({ format: "email" })),
    address: address,
    tags: Schema.Array(Schema.String(), { uniqueItems: true }),
});
type Iperson = Static<typeof personSchema>;

let company = Schema.Object({
    name: Schema.String(),
    employees: Schema.Array(personSchema),
    hq: address,
    industry: Schema.String({ enum: ["tech", "finance", "health"] as const }),
    notes: Schema.Optional(Schema.Nullable(Schema.String())),
    address: Schema.Object({}),
});
type Icompany = Static<typeof company>;

let nullableArray = Schema.Nullable(
    Schema.Array(Schema.Nullable(Schema.String())),
);
type InullableArray = Static<typeof nullableArray>; // (string | null)[] | null

// ─── Array: optional & nullable ─────────────────────────────────────────────

let optionalArray = Schema.Optional(Schema.Array(Schema.String()));
type IoptionalArray = Static<typeof optionalArray>; // string[]

let optionalNullableArray = Schema.Optional(
    Schema.Nullable(Schema.Array(Schema.Number())),
);
type IoptionalNullableArray = Static<typeof optionalNullableArray>; // number[] | null

// ─── Object: optional & nullable (nested) ───────────────────────────────────

let optionalObject = Schema.Optional(Schema.Object({ key: Schema.String() }));
type IoptionalObject = Static<typeof optionalObject>;
// { key: string }

let optionalNullableObject = Schema.Optional(
    Schema.Nullable(
        Schema.Object({
            key: Schema.String(),
            value: Schema.Optional(Schema.Number()),
        }),
    ),
);
type IoptionalNullableObject = Static<typeof optionalNullableObject>;
// { key: string; value?: number } | null

// ─── Nested optional Array & Object ─────────────────────────────────────────

let nestedOptionals = Schema.Nullable(
    Schema.Object(
        {
            name: Schema.String(),
            aliases: Schema.Optional(Schema.Array(Schema.String())),
            metadata: Schema.Optional(
                Schema.Object({
                    createdAt: Schema.String(),
                    updatedAt: Schema.Optional(Schema.String()),
                }),
            ),
            scores: Schema.Optional(
                Schema.Nullable(Schema.Array(Schema.Number())),
            ),
            backup: Schema.Optional(
                Schema.Nullable(Schema.Object({ url: Schema.String() })),
            ),
        },
        { description: "A complex object with nested optionals" },
    ),
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
logger.info({ baseSchema }, "=== Base schema ===");

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
logger.info({ fromSchema }, "=== From schema ===");
// { name: string; age: number; active?: boolean }

// ─── Composite ───────────────────────────────────────────────────────────────

let userSchema = Schema.Object({
    name: Schema.String(),
    email: Schema.String({ format: "email" }),
});

let profileSchema = Schema.Object({
    bio: Schema.Optional(Schema.String()),
    avatar: Schema.String(),
});

// basic merge — all keys from both schemas
let fullUser = Schema.Composite([userSchema, profileSchema]);
type IFullUser = Static<typeof fullUser>;
// { name: string; email: string; bio?: string; avatar: string }

// nullable schema — its keys become optional in the composite
let addressSchema = Schema.Nullable(
    Schema.Object({
        street: Schema.String(),
        city: Schema.String(),
    }),
);

let userWithAddress = Schema.Composite([userSchema, addressSchema]);
type IUserWithAddress = Static<typeof userWithAddress>;
// { name: string; email: string; street: string | null; city: string | null }

// composite itself can be nullable/optional
let nullableComposite = Schema.Nullable(
    Schema.Composite([userSchema, profileSchema]),
);
type INullableComposite = Static<typeof nullableComposite>;
// { name: string; email: string; bio?: string; avatar: string } | null

logger.info(
    { fullUser, userWithAddress, nullableComposite },
    "=== Composite schemas ===",
);

// ─── AnyOf / OneOf ───────────────────────────────────────────────────────────

// anyOf — value is one of several types (union)
let stringOrNumber = Schema.AnyOf([Schema.String(), Schema.Number()]);
type IStringOrNumber = Static<typeof stringOrNumber>; // string | number

// nullable anyOf
let stringOrNumberOrNull = Schema.Nullable(
    Schema.AnyOf([Schema.String(), Schema.Number()]),
);
type IStringOrNumberOrNull = Static<typeof stringOrNumberOrNull>; // string | number | null

// anyOf with objects
let catSchema = Schema.Object({ meow: Schema.Boolean() });
let dogSchema = Schema.Object({ bark: Schema.Boolean() });
let pet = Schema.AnyOf([catSchema, dogSchema]);
type IPet = Static<typeof pet>; // { meow: boolean } | { bark: boolean }

// oneOf — exactly one must match (same TS type as anyOf, stricter at validation)
let statusSchema = Schema.OneOf([
    Schema.String({ enum: ["active", "inactive"] as const }),
    Schema.Number({ enum: [0, 1] as const }),
]);
type IStatus = Static<typeof statusSchema>; // "active" | "inactive" | 0 | 1

// optional oneOf
let optionalPet = Schema.Optional(Schema.OneOf([catSchema, dogSchema]));
type IOptionalPet = Static<typeof optionalPet>; // { meow: boolean } | { bark: boolean }

// raw JSON schema with anyOf / oneOf (via as const or Schema.From)
const rawAnyOf = Schema.From({
    anyOf: [
        { type: "string" },
        {
            type: "object",
            properties: { id: { type: "number" } },
            required: ["id"],
        },
    ],
});
type IRawAnyOf = Static<typeof rawAnyOf>; // string | { id: number }

const rawOneOf = {
    oneOf: [{ type: "number" }, { type: "boolean" }],
} as const;
type IRawOneOf = Static<typeof rawOneOf>; // number | boolean

logger.info(
    {
        stringOrNumber,
        stringOrNumberOrNull,
        pet,
        statusSchema,
        optionalPet,
        rawAnyOf,
        rawOneOf,
    },
    "=== AnyOf / OneOf schemas ===",
);

// ─── Recursive ───────────────────────────────────────────────────────────────

type TreeNode = { value: string; children: TreeNode[] };

let treeSchema = Schema.Recursive<TreeNode>("TreeNode", (self) =>
    Schema.Object({
        value: Schema.String(),
        children: Schema.Array(self),
    }),
);
type ITree = Static<typeof treeSchema>; // TreeNode

type LinkedListNode = { data: number; next: LinkedListNode | null };

let linkedListSchema = Schema.Recursive<LinkedListNode>(
    "LinkedListNode",
    (self) =>
        Schema.Object({
            data: Schema.Number(),
            next: Schema.Nullable(Schema.AnyOf([self])),
        }),
);
type ILinkedList = Static<typeof linkedListSchema>; // LinkedListNode

logger.info({ treeSchema, linkedListSchema }, "=== Recursive schemas ===");

// ─── $schema and $id ─────────────────────────────────────────────────────────

let rootSchema = Schema.Object(
    {
        name: Schema.String(),
        version: Schema.String(),
    },
    {
        $schema: "http://json-schema.org/draft-07/schema#",
        $id: "https://example.com/config",
        description: "Application configuration",
    },
);
type IRootSchema = Static<typeof rootSchema>;
// { name: string; version: string }

let referenceable = Schema.Object(
    { code: Schema.String() },
    { $id: "https://example.com/code-block" },
);

logger.info({ rootSchema, referenceable }, "=== $schema / $id ===");

// ─── Any ─────────────────────────────────────────────────────────────────────

let anyType = Schema.Any();
type IAnyType = Static<typeof anyType>; // any

let optionalAny = Schema.Optional(Schema.Any());
type IOptionalAny = Static<typeof optionalAny>; // any

let describedAny = Schema.Any({ description: "arbitrary metadata payload" });
type IDescribedAny = Static<typeof describedAny>; // any

// any inside an object — useful for "pass-through" fields
let eventSchema = Schema.Object({
    type: Schema.String(),
    payload: Schema.Any(),
    meta: Schema.Optional(Schema.Any()),
});
type IEvent = Static<typeof eventSchema>;
// { type: string; payload: any; meta?: any }

logger.info(
    { anyType, optionalAny, describedAny, eventSchema },
    "=== Any schemas ===",
);

// ─── Record ──────────────────────────────────────────────────────────────────

// basic string-keyed record
let stringToNumber = Schema.Record(Schema.String(), Schema.Number());
type IStringToNumber = Static<typeof stringToNumber>; // Record<string, number>

// number-keyed record
let numberToString = Schema.Record(Schema.Number(), Schema.String());
type INumberToString = Static<typeof numberToString>; // Record<number, string>

// nullable record
let nullableRecord = Schema.Nullable(
    Schema.Record(Schema.String(), Schema.String()),
);
type INullableRecord = Static<typeof nullableRecord>; // Record<string, string> | null

// optional record
let optionalRecord = Schema.Optional(
    Schema.Record(Schema.String(), Schema.Boolean()),
);
type IOptionalRecord = Static<typeof optionalRecord>; // Record<string, boolean>

// record with object values
let userMap = Schema.Record(
    Schema.String(),
    Schema.Object({
        name: Schema.String(),
        age: Schema.Optional(Schema.Number()),
    }),
);
type IUserMap = Static<typeof userMap>;
// Record<string, { name: string; age?: number }>

// record with any values
let metadata = Schema.Record(Schema.String(), Schema.Any());
type IMetadata = Static<typeof metadata>; // Record<string, any>

// record inside an object
let configSchema = Schema.Object({
    version: Schema.Number(),
    settings: Schema.Record(Schema.String(), Schema.String()),
    headers: Schema.Optional(
        Schema.Record(Schema.String(), Schema.String()),
    ),
});
type IConfig = Static<typeof configSchema>;
// { version: number; settings: Record<string, string>; headers?: Record<string, string> }

logger.info(
    {
        stringToNumber,
        numberToString,
        nullableRecord,
        optionalRecord,
        userMap,
        metadata,
        configSchema,
    },
    "=== Record schemas ===",
);

// ─── Pick / Omit ─────────────────────────────────────────────────────────────

let fullUser2 = Schema.Object({
    name: Schema.String(),
    age: Schema.Number(),
    email: Schema.String(),
    bio: Schema.Optional(Schema.String()),
});

// Pick — keep only selected keys
let nameAndEmail = Schema.Pick(fullUser2, ["name", "email"]);
type INameAndEmail = Static<typeof nameAndEmail>; // { name: string; email: string }

let justName = Schema.Pick(fullUser2, ["name"]);
type IJustName = Static<typeof justName>; // { name: string }

// Pick preserves optional
let withOptional = Schema.Pick(fullUser2, ["name", "bio"]);
type IWithOptional = Static<typeof withOptional>; // { name: string; bio?: string }

// Omit — remove selected keys
let withoutEmail = Schema.Omit(fullUser2, ["email"]);
type IWithoutEmail = Static<typeof withoutEmail>;
// { name: string; age: number; bio?: string }

let withoutAgeAndBio = Schema.Omit(fullUser2, ["age", "bio"]);
type IWithoutAgeAndBio = Static<typeof withoutAgeAndBio>;
// { name: string; email: string }

// Pick/Omit result can be used in Composite
let extra = Schema.Object({ role: Schema.String() });
let composedPick = Schema.Composite([Schema.Pick(fullUser2, ["name"]), extra]);
type IComposedPick = Static<typeof composedPick>; // { name: string; role: string }

// Uncomment to see type error — "foo" does not exist:
// Schema.Pick(fullUser2, ["foo"]);
// Schema.Omit(fullUser2, ["foo"]);

logger.info(
    {
        nameAndEmail,
        justName,
        withOptional,
        withoutEmail,
        withoutAgeAndBio,
        composedPick,
    },
    "=== Pick / Omit schemas ===",
);
