/**
 * Validates that non-root imports from @bahatron/utils resolve with proper types
 * and that declaration emit succeeds (no "cannot be named" errors).
 *
 * Run:
 *   cd examples && npx tsc --noEmit
 */
import { Schema } from "@bahatron/utils/lib/json-schema/schema";
import { validate } from "@bahatron/utils/lib/json-schema/validator";
import { retry } from "@bahatron/utils/lib/helpers/retry";
import { sleep } from "@bahatron/utils/lib/helpers/sleep";
import { jsonStringify } from "@bahatron/utils/lib/helpers/json-stringify";

// ── json-schema: build a composite schema and infer its static type ──
const UserSchema = Schema.Object({
    id: Schema.Number(),
    name: Schema.String(),
    email: Schema.Optional(Schema.String()),
});

const WithTimestamps = Schema.Object({
    createdAt: Schema.String({ format: "date-time" }),
    updatedAt: Schema.String({ format: "date-time" }),
});

const FullUser = Schema.Composite([UserSchema, WithTimestamps]);

// Static<typeof FullUser> should resolve without "cannot be named" errors
type FullUserType = typeof FullUser.static;

// validate returns a typed value
const user: FullUserType = validate(
    {
        id: 1,
        name: "test",
        email: "test@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    FullUser,
);

console.log("Validated user:", jsonStringify(user));

// ── helpers: retry + sleep ──
async function example() {
    const result = await retry(
        async () => {
            await sleep(10);
            return 42;
        },
        { tries: 3, baseDelay: 100 },
    );

    console.log("Retry result:", result);
}

// ── exported function that returns a typebox-derived type ──
// This is the key test: if declaration emit can produce a .d.ts for this
// function without "cannot be named" errors, the fix works.
export function createUserSchema() {
    return Schema.Composite([UserSchema, WithTimestamps]);
}

export { user, example };
