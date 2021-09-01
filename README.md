# Utils

> npm install @bahatron/utils

A collection of utility functions and objects

## Logger

Fast and simple event driven logger.

```ts
import { Logger } from "@bahatron/utils";

const logger = Logger.Logger({
	id: "myLogger",
	pretty: false,
	debug: true
})

logger.on("error", async (entry) => {
	// doSomething
})

logger.warning({foo: "bar", "this is a warning")
```

## Helpers

### getenv

get env will throw an exception if MY_ENV_VAR is not set and there's no default value.
This is good for failing fast

```ts
import { Helpers } from "@bahatron/utils";

let val = Helpers.getenv("MY_ENV_VAR", "aDefaultValue");
```

### parallelize

Parallelize the work of a queue of item around a number of workers.
This is done through promises on the main thread rather than using child processes
Great for funnelling http calls

```ts
let httpCallsToMake = [...]

await parallelize({
	workers: 100,
	queue: httpCallsToMake,
	handler: async (item) => {
		// doYourThing
	}
})
```

## Validator

```ts
import { Validator } from "@bahatron/utils";

let errors = Validator.json(MyObject, MyJsonSchema);

let maybeString = Validator.optionalString(null); // undefined

let maybeInt = Validator.optionalInt("12"); // 12

let maybeInt = Validator.optionalInt("abc"); // undefined
```
