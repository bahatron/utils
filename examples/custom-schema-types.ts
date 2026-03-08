import {
    Static,
    TArray,
    TObject,
    TSchema,
    TUnsafe,
    Schema,
} from "@bahatron/utils/lib/json-schema";

export type Money = Static<ReturnType<typeof Money>>;
export function Money(description: string) {
    return Schema.Nullable(
        Schema.Object(
            {
                amount: Schema.Nullable(Schema.Number()),
                currency: Schema.Nullable(
                    Schema.StringEnum(["gbp", "usd", "eur"]),
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
