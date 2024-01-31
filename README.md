# TanStack Query helpers for JSON:API

[![Release](https://github.com/DASPRiD/tanstack-query-json-api/actions/workflows/release.yml/badge.svg)](https://github.com/DASPRiD/mikro-orm-js-joda/actions/workflows/release.yml)

This package helps you working with [JSON:API 1.1](https://jsonapi.org/) compliant API servers. In order to validate
and parse responses, it is assumed that you have [zod](https://www.npmjs.com/package/zod) installed.

## Installation

### npm
```bash
npm i tanstack-query-json-api
```

### pnpm
```bash
pnpm add tanstack-query-json-api
```

## Usage

### Responses with data only

#### 1. Create data schema

```typescript
import { z } from "zod";

const worldSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    someTransform: z.string().toLowerCase(),
});
export type World = z.output<typeof worldSchema>;
```

This schema is used to both validate the data in the response and doing possible transformations. Since transformations
are done within the selector, this allows caching the transformation result as long as the server responds with the
same JSON body.

#### 2. Creator selector

```typescript
import { createDataSelector } from "tanstack-query-json-api";

const worldSelector = createDataSelector(worldSchema);
```

#### 3. Create query

```typescript
import { handleJsonApiError } from "tanstack-query-json-api";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

export const useWorldQuery = (worldId: string): UseQueryResult<World> => {
    return useQuery({
        queryKey: ["world", worldId],
        queryFn: async ({ signal }) => {
            const response = await fetch(`https://my.api/worlds/${worldId}`, { signal });
            await handleJsonApiError(response);
            return response.json();
        },
        select: worldSelector,
    });
};
```

Please note:

- `handleJsonApiError` will take care of checking the response for 4xx or 5xx status codes. If the response is not
  successful it will throw a `JsonApiError` which contains all error information. This will be available in
  `queryResult.error`.
- There is no need to annotate the type of `response.json()` as the selector takes care of validating and inferring
  the type.

#### 4. Use the query

You can now use the query hook anywhere you want. The `queryResult.data` property will be of type `World`.

### Responses with non-paginated collections

Handling non-paginated collection responses is not much different from handling individual entities. All you have to do
is change the selector to accept arrays:

```typescript
const worldsSelector = createDataSelector(z.array(worldSchema));
```

Then just create a query hook with return type `UseQueryResult<World[]>`.

### Responses with paginated collections

If a collection uses pagination you have to create a complex selector. Despite its name this is pretty simple:

```typescript
import { requiredPageParams, parsePageParamsFromLink } from "tanstack-query-json-api";

const selectWorldsPaginated = createComplexApiSelector({
    dataSchema: z.array(worldSchema),
    transformer: (document) => ({
        pageParams: {
            first: requirePageParams(parsePageParamsFromLink(document.links?.first)),
            prev: parsePageParamsFromLink(document.links?.prev),
            next: parsePageParamsFromLink(document.links?.next),
            last: requirePageParams(parsePageParamsFromLink(document.links?.last)),
        },
        worlds: document.data,
    }),
});
export type PaginatedWorlds = ReturnType<typeof selectWorldsPaginated>;
```

Here we extract the world collection into the `world` property and define the page params. Note that we mark `first` and
`last` to be required in this example, while `prev` and `next` are allowed to be null.

If you need access to specific metadata and want to validate them, you can additionally supply a `metaSchema` to the
selector creation options. Otherwise `document.meta` will default to `Record<string, unknown> | undefined`.

Now we can write our query hook for the selector:

```typescript
import { injectPageParams } from "tanstack-query-json-api";

export const useWorldsQuery = (
    pageParams?: PageParams,
): UseQueryResult<PaginatedWorlds> => {
    return useQuery({
        queryKey: ["worlds", { pageParams }],
        queryFn: async ({ signal }) => {
            const url = new URL("https://my.api/worlds/");
            injectPageParams(url, pageParams);

            const response = await fetch(apiUrl("/worlds"), { signal });
            await handleApiError(response);
            return response.json();
        },
        select: selectWorldsPaginated,
        placeholderData: keepPreviousData,
    });
};
```

Here the function `injectPageParams()` takes care of injecting the page parameters into the URL when defined.
