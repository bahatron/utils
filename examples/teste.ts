import { Schema } from "../src/json-schema";
import { Formatters, Logger } from "../src/logger";

const logger = Logger({ formatter: Formatters.Yml });

const stringRecord = Schema.Record(
    Schema.String(),
    Schema.Object({ foo: Schema.String() }),
);
type StringRecord = Schema.Static<typeof stringRecord>;

const numberRecord = Schema.Record(Schema.Number(), Schema.Any());
type NumberRecord = Schema.Static<typeof numberRecord>;

logger.info({ stringRecord, numberRecord }, "=== Record schemas ===");
