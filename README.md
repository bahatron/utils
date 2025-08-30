# Utils

```
npm install @bahatron/utils
```

A collection of utility functions and objects

## Logger

Fast and simple event driven logger.

```ts
import { Logger } from "@bahatron/utils";

const logger = Logger.Create({
    id: "myLogger",
    pretty: false,
    debug: true,
});

logger.on("error", async (entry) => {
    // doSomething
});

logger.warning({ foo: "bar" }, "this is a warning");
```

## Helpers

Collection of highly useful helper functions

```ts
import { Helpers } from "@bahatron/utils";

const val = Helpers.getenv("MY_ENV_VAR", "aDefaultValue");

await Helpers.parallelize({
    workers: 100,
    queue: httpCallsToMake,
    handler: async (item) => {
        // doYourThing
    },
});
```

## JsonSchema

The JsonSchema object provides a schema builder (based on TypeForm) plus a typecaster validator (jsonschema)

```ts
import { JsonSchema } from "@bahatron/utils";

const schema = JsonSchema.Object({
    foo: JsonSchema.String(),
});

const myObject = JsonSchema.validate(
    {
        foo: "bar",
    },
    schema,
);

myObject.foo; // string
```

## Observable

Runtime agnostic and typehinted implementation of node's EventEmitter class.

```ts
import { Observable } from "@bahatron/utils";

const observer = Observable<"foo" | "bar">();

observer.once("foo", doSomething);

observer.emit("foo");
```
