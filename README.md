# @bahatron/utils

```bash
npm install @bahatron/utils
```

The only utility library you'll ever need - a comprehensive collection of TypeScript utilities for common programming tasks.

## Table of Contents

- [Logger](#logger)
- [Helpers](#helpers)
- [JsonSchema](#jsonschema)
- [Observable](#observable)
- [Error](#error)
- [Types](#types)

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

### Usage

```ts
import { Logger } from "@bahatron/utils";

const logger = Logger({
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

### API

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
        tries: 5,        // Number of retry attempts (default: 3)
        timeout: 1000,   // Base timeout in ms (default: 0)
        factor: 2,       // Exponential backoff factor (default: 1)
    }
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

const invalid = Helpers.jsonParse('invalid json');
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

Schema builder and validator based on TypeBox with extended utilities.

### Features

- Type-safe schema definitions
- Built-in validation
- Custom extensions: StringEnum, Nullable, Email, DateExtended
- Full TypeBox API support
- TypeScript type inference from schemas

### Usage

```ts
import { JsonSchema } from "@bahatron/utils";

// Define schema
const UserSchema = JsonSchema.Object({
    id: JsonSchema.Number(),
    email: JsonSchema.Email(),
    name: JsonSchema.String(),
    role: JsonSchema.StringEnum(["admin", "user", "guest"] as const),
    bio: JsonSchema.Nullable(JsonSchema.String()),
    createdAt: JsonSchema.DateExtended(),
});

// Validate data
const user = JsonSchema.validate(
    {
        id: 1,
        email: "user@example.com",
        name: "John Doe",
        role: "admin",
        bio: null,
        createdAt: new Date(),
    },
    UserSchema
);

// TypeScript knows the exact type
user.email; // string
user.role; // "admin" | "user" | "guest"
user.bio; // string | null
```

### Extended Methods

- `StringEnum(values)` - Create enum schema from string array
- `Nullable(type)` - Make any type nullable (uses `{type: [T, "null"]}` format)
- `Email()` - String with email format validation
- `DateExtended()` - Accept Date object or ISO date-time string

### Validation

The `validate` function returns the typed object if valid, or throws `ValidationFailed` error with details.

```ts
try {
    const data = JsonSchema.validate(input, schema);
} catch (err) {
    // err is ValidationFailed exception with error details
    console.error(err.context); // Array of validation errors
}
```

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
    console.error(err.message);    // "User not found"
    console.error(err.context);    // { userId: 123 }
}
```

---

## Types

TypeScript utility types for advanced type manipulation.

### `Resolved<T>`

Unwraps Promise types to get the resolved value type.

```ts
import { Types } from "@bahatron/utils";

async function fetchUser() {
    return { id: 1, name: "John" };
}

// Get the return type without await
type User = Types.Resolved<ReturnType<typeof fetchUser>>;
// Result: { id: number; name: string }

// Works with nested promises
type DoublePromise = Promise<Promise<string>>;
type Unwrapped = Types.Resolved<DoublePromise>;
// Result: string
```

---

## License

Apache-2.0

## Contributing

Issues and pull requests are welcome at [github.com/bahatron/utils](https://github.com/bahatron/utils)
