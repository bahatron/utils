import { TSchema, Schema } from "@bahatron/utils/lib/json-schema";

export function ExtendedTypeM<T extends TSchema>(schema: T) {
    return Schema.Composite([Schema.Object({ foo: Schema.String() }), schema]);
}

let extend = ExtendedTypeM(Schema.Object({ bar: Schema.Number() }));
