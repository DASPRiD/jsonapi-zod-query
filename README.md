# JSON:API Query Helpers utilizing Zod

[![Release](https://github.com/DASPRiD/jsonapi-zod-query/actions/workflows/release.yml/badge.svg)](https://github.com/DASPRiD/mikro-orm-js-joda/actions/workflows/release.yml)
[![codecov](https://codecov.io/gh/DASPRiD/jsonapi-zod-query/graph/badge.svg?token=UuDIjaXCq7)](https://codecov.io/gh/DASPRiD/jsonapi-zod-query)

This package helps you to work with [JSON:API 1.1](https://jsonapi.org/) compliant API servers. In order to validate
and parse responses, it is assumed that you have [zod](https://www.npmjs.com/package/zod) installed.

There are no assumption made about how you query your data, except that you are using `fetch`. Selectors from this
library can be used with e.g. [TanStack Query](https://tanstack.com/query/latest).

Selectors from this library will flatten down all resources and relationships. This makes it easier to work with those
entities in the frontend.

## Installation

### npm
```bash
npm i jsonapi-zod-query
```

### pnpm
```bash
pnpm add jsonapi-zod-query
```

## Usage

At its core you create selectors there are three kinds of selectors you can create, namely resource, nullable resource
and resource collection. All selectors take the same configuration but will yield different parsers.

First you define the primary resource of the document. A resource is defined by its type and optionally an attributes
schema and a relationships definition.

### Simple example

In this example we show off how to create a selector for a single resource with only attributes defined.

```typescript
import { z } from "zod";
import { createResourceSelector } from "jsonapi-zod-query";

const articleSelector = createResourceSelector({
    type: "article",
    attributesSchema: z.object({
        title: z.string(),
    }),
});
```

You can now use the selector in your query functions like this:

```typescript
const response = await fetch("https://example.com");
const body = await response.json() as unknown;
const document = articleSelector(body);
```

### Response error handling

Of course, the example above assumes that the response is always successful. In the real world you cannot make that
assumption. For this reason there is a utility function which automatically handles errors for your:

```typescript
import { handleJsonApiError } from "jsonapi-zod-query";

const response = await fetch("https://example.com");
await handleJsonApiError(response);
```

If the request is successful (2xx range), the function call is a no-op. Otherwise, it will try to parse the error
response and throw a matching `JsonApiError`. 

### Nullable and collection selectors

If a response can contain a nullable primary resource, you want to use `createNullableResourceSelector()` instead.
If the response is for a resource collection, you must use `createResourceCollectionSelector()`.

They are configured the exact same way as `createResourceSelector()`.

### Extracting data

The resource selectors will always return the entire (flattened) document. In most cases you might only be interested
in the `data` property. To facilitate this you can wrap the selector:

```typescript
import { createDataSelector, createResourceSelector } from "jsonapi-zod-query";

const articleSelector = createDataSelector(createResourceSelector(/* … */));
```

### Handling pagination

This library assumes that you never actually use the `links` properties in the JSON:API documents, but are primarily
interested in the pagination functionality for your own queries. Page params are automatically extracted by the
selector created through `createResourceCollectionSelector()`.

You can access the page parameters through the `pageParams` properties, which will contain the parameters defined in the
links through the `first`, `prev`, `next` and `last` properties.

You can pass these parameters to your query function. Before performing your fetch, you have to inject the parameters
into the URL again:

```typescript
import { injectPageParams } from "jsonapi-zod-query";

const url = new URL("https://example.com");
injectPageParams(pageParams);
```

### Relationships

You can define relationships for each resource through the `relationships` object. Each key matches the field name
in the JSON:API body and an object defines how the relationship should be handled.

You must always define a `relationshipType`, which can be either `one`, `one_nullable` or `many`. Additionally, you
must define one of the following two properties:

- `resourceType`

  When defining the resource type, the relationship is considered be just an identifier. In this case it will result in
  an entity with just an `id` defined.

- `include`

  If the response document contains included resource, you can define this to inline the resource into the result. This
  parameter has the same configuration as the primary resource.

> **TypeScript limitation**
> 
> Due to limitations in TypeScript, the configuration fails to apply type hinting for relationships within
> relationships. To work around this, you can utilize the `satisfies` operator:
> 
> ```typescript
> const selector = createResourceSelector({
>     type: "article",
>     relationships: {
>         author: {
>             resourceType: "person",
>             relationshipType: "one",
>             include: {
>                 type: "person",
>                 relationships: {
>                     profile: {
>                         relationshipType: "one",
>                         include: {
>                             type: "profile",
>                             attributesSchema: z.object({
>                                 emailAddress: z.string(),
>                             }),
>                         },
>                     },
>                 } satisfies Relationships,
>             },
>         },
>     },
> });
> ```
