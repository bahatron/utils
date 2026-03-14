import { type Static, Schema } from "../../src/json-schema";
import { Logger } from "../../src";
import { Formatters } from "../../src/logger";

let logger = Logger.Logger({ formatter: Formatters.Pretty });

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

// Output:
//   numberType             → { type: "number" }
//   nullableNumberType     → { type: ["number", "null"] }
//   enumNumberType         → { type: "number", enum: [1, 2, 3] }
//   nullableEnumNumberType → { type: ["number", "null"], enum: [10, 20, 30] }
//   numberWithOptions      → { minimum: 0, maximum: 100, multipleOf: 5, description: "percentage in steps of 5", type: "number" }
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
