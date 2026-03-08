import {
    Static,
    TArray,
    TObject,
    TSchema,
    TUnsafe,
    Schema,
} from "@bahatron/utils/lib/json-schema";
import { JsonSchema } from "@bahatron/utils";

export type Money = Static<ReturnType<typeof Money>>;
export function Money(description: string) {
    return JsonSchema.Nullable(
        JsonSchema.Object(
            {
                amount: JsonSchema.Nullable(JsonSchema.Number()),
                currency: JsonSchema.Nullable(
                    JsonSchema.StringEnum(["gbp", "usd", "eur"]),
                ),
            },
            {
                description: description,
            },
        ),
    );
}

export type Percentage = Static<ReturnType<typeof Percentage>>;
export function Percentage(description: string) {
    return Schema.Nullable(
        Schema.Object(
            {
                value: Schema.Nullable(Schema.Number({})),
                display: Schema.Nullable(
                    Schema.String({
                        description:
                            "Percentage value as string, e.g. '75%' with context around the percentage if available",
                    }),
                ),
            },
            {
                description,
            },
        ),
    );
}

const ExpandedItemSchema = Schema.Object({
    is_explicit: Schema.Boolean({
        description:
            "True only when the source explicitly labels the figure with the expected metric label.",
    }),
    found: Schema.Boolean({
        description:
            "True only if this metric is explicitly found in the source document.",
    }),
    pdf_page: Schema.Nullable(
        Schema.Number({
            description:
                "The page number the field was extracted from if the source file was a PDF. Null otherwise.",
        }),
    ),
    sheet_name: Schema.Nullable(
        Schema.String({
            description:
                "The sheet name the field was extracted from if the source file was NOT a PDF. Null otherwise.",
        }),
    ),
    raw_text: Schema.Nullable(
        Schema.String({
            description: "Exact supporting source snippet used for extraction.",
        }),
    ),
});

export function ExpandedItem<T extends TSchema>(schema: T) {
    return Schema.Nullable(
        Schema.Composite([
            ExpandedItemSchema,
            Schema.Object({ value: schema }),
        ]),
    );
}

const composed = JsonSchema.Composite(
    [
        JsonSchema.Object({ foo: JsonSchema.String() }),
        JsonSchema.Object({ bar: JsonSchema.Number() }),
    ],
    {
        description: "A composite schema that combines two object schemas.",
        additionalProperties: false,
    },
);

console.log(composed);

function merger<T extends TSchema>(schemas: T[]) {
    return Schema.Evaluate(Schema.Intersect(schemas));
}

const A = Schema.Object({ a: Schema.Number() });
const B = Schema.Object({ b: Schema.Number() });
const C = Schema.Object({ c: Schema.Number() });

const composite = Schema.Composite([A, B, C]);
