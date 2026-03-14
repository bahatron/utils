import { type Static, Schema } from "../../src/json-schema";
import { Logger } from "../../src";
import { Formatters } from "../../src/logger";

let logger = Logger.Logger({ formatter: Formatters.Pretty });

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

// Output:
//   fullUser         → { type: "object", properties: { name: { type: "string" }, email: { format: "email", type: "string" }, bio: { type: "string", _optional: true }, avatar: { type: "string" } }, required: ["name", "email", "avatar"] }
//   userWithAddress  → { type: "object", properties: { name: "[Reference]", email: "[Reference]", street: { type: ["string", "null"] }, city: { type: ["string", "null"] } }, required: ["name", "email", "street", "city"] }
//   nullableComposite → { type: ["object", "null"], properties: { name: "[Reference]", email: "[Reference]", bio: "[Reference]", avatar: "[Reference]" }, required: ["name", "email", "avatar"] }
logger.info(
    { fullUser, userWithAddress, nullableComposite },
    "=== Composite schemas ===",
);
