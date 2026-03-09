import { TSchema } from "../src/json-schema";
import { JsonSchema } from "../src";

const type1 = JsonSchema.Object({ foo: JsonSchema.String() });
const type2 = JsonSchema.Object({ bar: JsonSchema.Number() });

export function ExpandedItem(schema: TSchema) {
    const ExpandedItemSchema = JsonSchema.Object({
        metadata: type1,
    });

    return JsonSchema.Nullable(
        JsonSchema.Composite(
            [
                ExpandedItemSchema,
                JsonSchema.Object({
                    value: schema,
                }),
            ],
            {
                description:
                    "An expanded item schema that includes metadata and a value",
            },
        ),
    );
}

const wrappedType = ExpandedItem(JsonSchema.Nullable(type2));

console.log(wrappedType);
