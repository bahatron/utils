import { Schema } from "../src/json-schema";

let nullableString = Schema.Nullable(Schema.String());
let nullableArray = Schema.Nullable(Schema.Array(Schema.Number()));
let nullableEnum = Schema.Nullable(
    Schema.StringEnum(["a", "b", "c"], { description: "some enum values" }),
);
let nullableObject = Schema.Nullable(
    Schema.Object({
        id: Schema.Number(),
        name: Schema.Nullable(Schema.String()),
        email: Schema.Nullable(Schema.Email()),
        createdAt: Schema.Nullable(Schema.DateExtended()),
    }),
);

console.log("Nullable String Schema:", JSON.stringify(nullableString, null, 2));
console.log("Nullable Array Schema:", JSON.stringify(nullableArray, null, 2));
console.log("Nullable Enum Schema:", JSON.stringify(nullableEnum, null, 2));
console.log("Nullable Object Schema:", JSON.stringify(nullableObject, null, 2));
