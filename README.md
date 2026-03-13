# @bahatron/utils

```bash
npm install @bahatron/utils
```

The only utility library you'll ever need - a comprehensive collection of TypeScript utilities for common programming tasks.

## Table of Contents

- [v5 Breaking Changes & Migration Guide](#v5-breaking-changes--migration-guide)
- [Logger](#logger)
- [Helpers](#helpers)
- [JsonSchema](#jsonschema)
- [Observable](#observable)
- [Error](#error)

---

## v5 Breaking Changes & Migration Guide

### Breaking Changes

1. **`typebox` dependency removed** — all schema types (`TSchema`, `Static`, etc.) are now built-in. The `typebox` package is no longer a dependency.

2. **`Types` export removed** — `Types.Resolved<T>`, `Types.Falsy`, and `Types.Truthy` are no longer exported. Use TypeScript's built-in `Awaited<T>` instead of `Resolved<T>`.

3. **`JsonSchema` import path changed** — the top-level export is now a namespace containing `Schema`, not the schema builder directly.

4. **`Logger.Create` renamed to `Logger.Logger`** — the default export was removed in favour of a named export.

5. **`Logger.Formatters` restructured** — `Formatters.Pretty` (was `PrettyFormatter`) and `Formatters.Yml` (was `YmlFormatter`) are now named exports under a `Formatters` namespace.

6. **Schema builder API replaced** — TypeBox-based helpers (`StringEnum`, `Nullable`, `Email`, `DateExtended`) are replaced by a new built-in schema system with `nullable` and `enum` options on each builder. `Composite` replaces manual `allOf` composition.

### Migration Guide

```ts
// ─── Imports ─────────────────────────────────────────────────────────────────

// v4
import { JsonSchema, Types, Logger } from "@bahatron/utils";
JsonSchema.StringEnum(["a", "b"] as const);
JsonSchema.Nullable(JsonSchema.String());
type T = Types.Resolved<Promise<string>>;
const logger = Logger.Create({ id: "app" });
Logger.Formatters.Pretty(entry);

// v5
import { JsonSchema, Logger } from "@bahatron/utils";
const { Schema } = JsonSchema;
Schema.String({ enum: ["a", "b"] as const }); // "a" | "b"
Schema.String({ nullable: true }); // string | null
type T = Awaited<Promise<string>>; // built-in TS utility
const logger = Logger.Logger({ id: "app" });
Logger.Formatters.Pretty(entry);

// ─── Schema builders ────────────────────────────────────────────────────────

// v4 (TypeBox)
import { JsonSchema } from "@bahatron/utils";
JsonSchema.String();
JsonSchema.StringEnum(["a", "b"] as const);
JsonSchema.Nullable(JsonSchema.String());
JsonSchema.Email();

// v5
const { Schema } = JsonSchema;
Schema.String();
Schema.String({ enum: ["a", "b"] as const });
Schema.String({ nullable: true });
Schema.String({ format: "email" });

// ─── Validation ─────────────────────────────────────────────────────────────

// v4
JsonSchema.validate(data, schema);

// v5
const { Schema } = JsonSchema;
Schema.validate(data, schema); // same behaviour, now under Schema namespace
```

---

## Logger

Fast and simple event-driven logger with customizable formatting and log level control.

### Features

- Event-driven architecture for async processing
- Multiple log levels: DEBUG, INFO, WARNING, ERROR
- Customizable formatters (JSON or pretty-print)
- Dynamic logger ID via function or string
- Non-blocking async handlers
- Minimum log level filtering
- Symbol and circular reference serialization in context

### Usage

```ts
import { Logger } from "@bahatron/utils";

const logger = Logger.Logger({
    id: "myLogger",
    pretty: false,
    minLogLevel: "INFO",
});

// Log messages
logger.debug({ userId: 123 }, "User action");
logger.info("Application started");
logger.warn({ retry: 3 }, "Retrying operation");
logger.error(new Error("Something went wrong"), "Operation failed");

// Listen to log events
const handler = logger.on("ERROR", async (entry) => {
    // Send to error tracking service
    await sendToSentry(entry);
});

// Wait for all async handlers to complete
await logger.flush();

// Remove handler
logger.off("ERROR", handler);
```

### Formatters

```ts
import { Logger } from "@bahatron/utils";

Logger.Formatters.Pretty(entry); // Human-readable coloured output
Logger.Formatters.Yml(context); // YAML-like indented format
```

### API

- `Logger.Logger(options?)` - Create a new logger instance
- `logger.debug(context, message?)` - Log debug information
- `logger.info(context, message?)` - Log informational messages
- `logger.warn(context, message?)` - Log warnings
- `logger.error(err, message?)` - Log errors
- `logger.on(level, handler)` - Attach async handler to log level
- `logger.off(level, handler)` - Remove handler
- `logger.flush()` - Wait for all pending async handlers

---

## Helpers

Collection of highly useful helper functions for common tasks.

### `parallelize`

Execute tasks in parallel with controlled concurrency using a worker pool.

```ts
import { Helpers } from "@bahatron/utils";

const urls = ["url1", "url2", "url3", ...];

await Helpers.parallelize({
    workers: 10,
    queue: urls,
    handler: async (url) => {
        const data = await fetch(url);
        // process data
    },
});
```

### `retry`

Retry a function with exponential backoff on failure.

```ts
import { Helpers } from "@bahatron/utils";

const result = await Helpers.retry(
    async () => {
        return await unstableApiCall();
    },
    {
        tries: 5, // Number of retry attempts (default: 3)
        baseDelay: 1000, // Base timeout in ms (default: 0)
        factor: 2, // Exponential backoff factor (default: 1)
    },
);
```

### `getenv`

Safely retrieve environment variables with optional default values.

```ts
import { Helpers } from "@bahatron/utils";

// With default value
const apiKey = Helpers.getenv("API_KEY", "default-key");

// Without default (throws InternalError if not set)
const dbUrl = Helpers.getenv("DATABASE_URL");
```

### `sleep`

Pause execution for a specified duration.

```ts
import { Helpers } from "@bahatron/utils";

await Helpers.sleep(2000); // Sleep for 2 seconds
```

### `jsonStringify`

Safe JSON stringification with circular reference handling using fast-safe-stringify.

```ts
import { Helpers } from "@bahatron/utils";

const circularObj = { a: 1 };
circularObj.self = circularObj;

const json = Helpers.jsonStringify(circularObj);
// Returns safe JSON string instead of throwing
```

### `jsonParse`

Safe JSON parsing that returns `undefined` instead of throwing errors.

```ts
import { Helpers } from "@bahatron/utils";

const obj = Helpers.jsonParse('{"valid": "json"}');
// Returns: { valid: "json" }

const invalid = Helpers.jsonParse("invalid json");
// Returns: undefined (instead of throwing)
```

### `execute`

Wrapper for command-line scripts with proper error handling and process exit codes.

```ts
import { Helpers } from "@bahatron/utils";

Helpers.execute(async () => {
    // Your script logic
    await doSomething();
    // Exits with code 0 on success, 1 on error
});
```

---

## JsonSchema

Type-safe JSON Schema builder with full TypeScript inference — no external schema library required.

### Features

- Zero-dependency schema builders (`String`, `Number`, `Boolean`, `Array`, `Object`, `Const`, `Composite`, `AnyOf`, `OneOf`, `Recursive`)
- Full TypeScript type inference via `Static<T>` branded types
- Raw `as const` schema inference via `InferRawSchema<T>`
- `Schema.From()` for inferring schemas from non-`as const` objects and JSON imports
- `nullable`, `optional`, `enum` options on every builder
- `$id`, `$schema`, `description`, `title` metadata on every builder
- `addSchema()` / `$ref` for reusable sub-schemas
- Runtime validation using [jsonschema](https://www.npmjs.com/package/jsonschema)

### Import

```ts
import { JsonSchema } from "@bahatron/utils";
const { Schema } = JsonSchema;

// Type helpers
import type { JsonSchema } from "@bahatron/utils";
type MyType = JsonSchema.Static<typeof MySchema>;
type RawInferred = JsonSchema.InferRawSchema<typeof rawSchema>;
```

### Schema Builders

#### Primitives

```ts
Schema.String(); // string
Schema.String({ nullable: true }); // string | null
Schema.String({ enum: ["a", "b"] as const }); // "a" | "b"
Schema.String({ format: "email" }); // string (validated as email)

Schema.Number(); // number
Schema.Number({ enum: [1, 2, 3] as const }); // 1 | 2 | 3

Schema.Boolean(); // boolean
Schema.Boolean({ nullable: true }); // boolean | null
```

#### Const

```ts
Schema.Const("active"); // "active"
Schema.Const(42); // 42
```

#### Array

```ts
Schema.Array(Schema.String()); // string[]
Schema.Array(Schema.Number(), { nullable: true }); // number[] | null
```

#### Object

```ts
const UserSchema = Schema.Object({
    id: Schema.Number(),
    name: Schema.String(),
    role: Schema.String({ enum: ["admin", "user"] as const }),
    bio: Schema.String({ nullable: true, optional: true }),
});

type User = JsonSchema.Static<typeof UserSchema>;
// { id: number; name: string; role: "admin" | "user"; bio?: string | null }
```

#### Composite

Merges multiple object schemas into one. Handles nullable source schemas.

```ts
const BaseSchema = Schema.Object({
    id: Schema.Number(),
    createdAt: Schema.String(),
});

const UserSchema = Schema.Composite(
    BaseSchema,
    Schema.Object({
        name: Schema.String(),
        email: Schema.String(),
    }),
);
// { id: number; createdAt: string; name: string; email: string }
```

#### AnyOf / OneOf

```ts
const StatusSchema = Schema.AnyOf(Schema.String(), Schema.Number());
// string | number

const EventSchema = Schema.OneOf(
    Schema.Object({ type: Schema.Const("click"), x: Schema.Number() }),
    Schema.Object({ type: Schema.Const("key"), code: Schema.String() }),
    { discriminator: { propertyName: "type" } },
);
// { type: "click"; x: number } | { type: "key"; code: string }
```

#### Recursive

Define self-referencing schemas using `$ref`. The schema is automatically registered for validation.

```ts
const TreeSchema = Schema.Recursive("TreeNode", (self) =>
    Schema.Object({
        value: Schema.String(),
        children: Schema.Array(self, { nullable: true }),
    }),
);
// { value: string; children: TreeNode[] | null }
```

#### From

Infer a typed schema from an untyped source (e.g. a JSON import or a non-`as const` object). The type is provided via the `const` generic parameter.

```ts
const raw = { type: "string" } as const;
const schema = Schema.From<string>(raw);
// TSchema<string> backed by { type: "string" }
```

### Raw Schema Inference

Use `InferRawSchema` to extract TypeScript types directly from `as const` JSON Schema objects — no builder functions needed:

```ts
const schema = {
    type: "object",
    properties: {
        id: { type: "number" },
        name: { type: "string" },
        role: { enum: ["admin", "user"] },
        active: { const: true },
    },
    required: ["id", "name", "role", "active"],
} as const;

type MyType = JsonSchema.InferRawSchema<typeof schema>;
// { id: number; name: string; role: "admin" | "user"; active: true }
```

Supported keywords: `type`, `const`, `enum`, `properties`/`required`, `items`, `anyOf`, `oneOf`, `nullable`.

### Validation

The `validate` function returns the typed object if valid, or throws `ValidationFailed` with details.

```ts
const UserSchema = Schema.Object({
    id: Schema.Number(),
    name: Schema.String(),
});

// Returns typed object
const user = Schema.validate({ id: 1, name: "John" }, UserSchema);
user.id; // number
user.name; // string

// Throws on invalid data
try {
    Schema.validate({ id: "bad" }, UserSchema);
} catch (err) {
    // err is ValidationFailed with error details
    console.error(err.context);
}
```

### API Reference

**Builders** — all accept an options object with `nullable?`, `optional?`, `$id?`, `$schema?`, `description?`, `title?`:

- `Schema.Const(value, opts?)` — literal value schema
- `Schema.String(opts?)` — string schema (supports `enum`, `format`)
- `Schema.Number(opts?)` — number schema (supports `enum`)
- `Schema.Boolean(opts?)` — boolean schema
- `Schema.Array(items, opts?)` — array schema
- `Schema.Object(properties, opts?)` — object schema (supports `additionalProperties`)
- `Schema.Composite(...schemas)` — merge multiple object schemas
- `Schema.AnyOf(...schemas, opts?)` — union (any match)
- `Schema.OneOf(...schemas, opts?)` — union (exactly one match, supports `discriminator`)
- `Schema.Recursive(id, builder)` — self-referencing schema via `$ref`
- `Schema.From<T>(raw)` — wrap a raw schema with a type parameter

**Validation:**

- `Schema.validate(data, schema)` — validate and return typed data, or throw `ValidationFailed`
- `Schema.addSchema(schema, uri)` — register a schema for `$ref` resolution

---

## Observable

Runtime-agnostic, type-safe implementation of event emitter pattern.

### Features

- Type-safe event names and payloads
- Handler registration and removal
- One-time event handlers
- Global event listeners
- No dependencies on Node.js EventEmitter

### Usage

```ts
import { Observable } from "@bahatron/utils";

// Define events with types
type Events = "userCreated" | "userDeleted" | "userUpdated";
type Payload = { userId: number; timestamp: Date };

const events = Observable<Events, Payload>();

// Listen to specific event
events.on("userCreated", (payload) => {
    console.log(`User ${payload.userId} created`);
});

// Listen once
events.once("userDeleted", (payload) => {
    console.log(`User ${payload.userId} deleted`);
});

// Listen to all events
events.onEvent((event, payload) => {
    console.log(`Event: ${event}`, payload);
});

// Emit events
events.emit("userCreated", { userId: 123, timestamp: new Date() });

// Remove listener
const handler = (payload) => console.log(payload);
events.on("userUpdated", handler);
events.off("userUpdated", handler);
```

### API

- `on(event, handler)` - Register event handler
- `once(event, handler)` - Register one-time handler
- `onEvent(handler)` - Register global handler for all events
- `off(event, handler)` - Remove event handler
- `emit(event, payload?)` - Emit event with optional payload

---

## Error

Pre-configured HTTP exception classes for common error scenarios.

### Available Exceptions

All exceptions include:

- `name` - Error name
- `message` - Error message
- `statusCode` / `code` - HTTP status code
- `context` - Additional error context

```ts
import { Error } from "@bahatron/utils";

// 4xx Client Errors
throw Error.BadRequest({ field: "email" }, "Invalid email format");
throw Error.ValidationFailed({ errors: [...] });
throw Error.Unauthorized();
throw Error.PaymentRequired();
throw Error.Forbidden();
throw Error.NotFound({ resource: "user", id: 123 });
throw Error.NotAcceptable();
throw Error.TimeOut();
throw Error.Conflict({ reason: "duplicate email" });
throw Error.Gone();
throw Error.PreconditionFailed();
throw Error.PayloadTooLarge();
throw Error.URITooLong();
throw Error.UnsupportedMediaType();
throw Error.ExpectationFailed();
throw Error.UnprocessableEntity();
throw Error.TooManyRequests();

// 5xx Server Errors
throw Error.InternalError(err, "Database connection failed");
throw Error.NotImplemented();
```

### Usage Example

```ts
import { Error } from "@bahatron/utils";

function getUser(id: number) {
    const user = db.users.find(id);

    if (!user) {
        throw Error.NotFound({ userId: id }, "User not found");
    }

    return user;
}

try {
    const user = getUser(123);
} catch (err) {
    console.error(err.statusCode); // 404
    console.error(err.message); // "User not found"
    console.error(err.context); // { userId: 123 }
}
```

---

## License

Apache-2.0

## Contributing

Issues and pull requests are welcome at [github.com/bahatron/utils](https://github.com/bahatron/utils)
