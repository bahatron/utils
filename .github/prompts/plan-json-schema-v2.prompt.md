# Plan: Custom JSON Schema Builder (replacing typebox)

Replace `typebox` with a custom JSON schema builder in `src/json-schema/schema-v2.ts`. Builder functions produce plain JSON Schema objects with embedded TypeScript type information via branded/phantom types. A `Static<T>` utility type extracts the TS type from any schema definition. V1 focuses on primitives + typecast;

## Phase 1: Core Schema Builder (`src/json-schema/schema-v2.ts`)

1. **Define base branded type** — `Static<T>` wraps a plain JSON Schema object while carrying the inferred TS type as a phantom generic. A unique symbol brand keeps runtime JSON unaffected.

2. **Implement primitive builders** — Each builder accepts an options object. Options include the relevant JSON Schema keywords for that type **plus `nullable` and `enum`**.
    - **`nullable: true`** → `type` becomes an array including `"null"` (e.g. `["number", "null"]`), TS type gains `| null`.
    - **`enum: ["a", "b"] as const`** → adds `enum` to the JSON Schema output, and the TS type **narrows to the union of the enum values** instead of the base type. When combined with `nullable`, the type becomes e.g. `"a" | "b" | null`.
    - `String(options?)` → `TSchema<string>` / `TSchema<"a" | "b">` if `enum` provided / `| null` if `nullable`
    - `Number(options?)` → `TSchema<number>` / `TSchema<1 | 2 | 3>` if `enum` provided / `| null` if `nullable`
    - `Boolean(options?)` → `TSchema<boolean>` / `| null` if `nullable` (no enum for boolean)
    - Options mirror JSON Schema keywords per type (`minLength`, `pattern` for String; `minimum`, `maximum` for Number; etc.)

3. **Implement `Array(itemSchema, options?)`** → `TSchema<Static<itemSchema>[]>` producing `{ type: "array", items: itemSchema, ...options }`. Also supports `nullable: true` → `{ type: ["array", "null"], ... }` with TS type `T[] | null`.

4. **Implement `Object(properties, options?)`** → Takes `{ [key]: TSchema<any> }`, returns `TSchema<{ [key]: Static<each> }>` producing `{ type: "object", properties: {...}, required: [...] }`.
    - All properties are **required by default**.
    - Options accepts `optional: string[]` — an array of property keys to **exclude from the `required` array**. These keys become optional in the inferred TS type.
    - Also supports `nullable: true` → `{ type: ["object", "null"], ... }` with TS type `T | null`.

5. **Implement `Static<T>` type** — Conditional type that extracts the phantom `T` from `TSchema<T>`. Replaces typebox's `Static`.

6. **Export a `Schema` object** — Bundle all builders as named functions on a single export, matching the current pattern.

## Phase 2: Integration & Migration

7. **Update `src/json-schema/index.ts`** — Re-export from `schema-v2.ts` instead of `schema.ts`. Export `Static` and `TSchema` replacing typebox re-exports.

8. **Update `src/json-schema/validator.ts`** — Replace typebox `TSchema`/`Static` imports with new local types. `jsonschema` validation logic stays unchanged (schemas are still plain JSON Schema objects).

9. **Update `src/index.ts`** — Ensure `JsonSchema` export points to the new builder.

## Phase 3: Tests & Cleanup

10. **Update `tests/json-schema.test.ts`** — Adapt existing test + add tests for each primitive, Array, Object, and `Static` type inference (using `expectTypeOf` from vitest).

11. **Remove `typebox` dependency** from `package.json`.

12. **Update `playground/schema-composition.ts`** — Comment out with TODO until Nullable/Composite are added in V2.

## Relevant Files

- `src/json-schema/schema-v2.ts` — **NEW**: all builder functions and types
- `src/json-schema/schema.ts` — OLD: kept for reference
- `src/json-schema/index.ts` — re-export pivot point
- `src/json-schema/validator.ts` — replace typebox imports
- `src/index.ts` — top-level export (likely unchanged)

## Verification

2. `npm run build` — clean compile with no typebox references in output
3. Type-level: `expectTypeOf<Static<typeof schema>>().toEqualTypeOf<{ name: string; age: number }>()` compiles
4. `grep -r "typebox" src/ lib/` returns nothing after cleanup
5. use something like `playground/schema-v2-test.ts` based on `playground/schema-composition.ts` to test real-world schema definitions (comment out until V2 features are added)

## Decisions

- **V1 includes**: String, Number, Boolean, Array, Object + `Static` typecast + validate + `nullable` option on all builders + `optional` keys on Object
- **V1 excludes**: Email, Date, DateExtended, Composite, Union, Intersect → deferred to V2
- **All Object properties required by default** — pass `optional: ["key1", "key2"]` to exclude specific keys from `required`
- **Nullable is a per-builder option**, not a wrapper — `Number({ nullable: true })` → `{ type: ["number", "null"] }`
- **`jsonschema` npm package stays** for runtime validation
- **Schema objects are plain JSON Schema at runtime** — branded type is purely compile-time, zero overhead
- **`schema.ts` (old) kept until V2** extensions are ported

## Further Considerations

1. **Optional properties** — `Object()` accepts `optional: string[]` in options to exclude keys from `required`. Included in V1.
2. **StringEnum** — No longer needed as a separate builder. `String({ enum: ["a", "b"] as const })` replaces it, with the TS type narrowing to `"a" | "b"`. Same applies to `Number({ enum: [1, 2, 3] as const })`.
3. **Playground** — Comment out `playground/schema-composition.ts` with TODO noting V2 dependency.
