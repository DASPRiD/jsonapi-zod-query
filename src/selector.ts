import type { ZodTypeAny, z } from "zod";
import type {
    AnyRelationshipDeserializer,
    AnyResourceDeserializer,
    DocumentResult,
    NullableResourceDocumentResult,
    RelationshipResult,
    ResourceCollectionDocumentResult,
    ResourceDocumentResult,
    ResourceResult,
} from "./deserializer.ts";
import { parsePageParamsFromLink } from "./pagination.ts";
import {
    type DocumentSchema,
    type RelationshipSchema,
    type ResourceSchema,
    createNullableResourceDocumentSchema,
    createResourceCollectionDocumentSchema,
    createResourceDocumentSchema,
    createResourceSchema,
} from "./parser-schemas.ts";
import type { DefaultMeta } from "./standard-schemas.ts";

type IncludedResource = {
    raw: unknown;
    processed?: ResourceResult<AnyResourceDeserializer>;
};

type ResourceSchemaCache = Map<string, ResourceSchema<AnyResourceDeserializer>>;
type Included = Map<string, IncludedResource>;

const prepareIncludedMap = (document: z.output<DocumentSchema<z.ZodTypeAny, z.ZodTypeAny>>) =>
    new Map<string, IncludedResource>(
        document.included?.map((resource) => [
            `${resource.type}:::${resource.id}`,
            { raw: resource },
        ]) ?? [],
    );

const includeResource = (
    type: string,
    id: string,
    path: string,
    included: Included,
    resourceSchemaCache: ResourceSchemaCache,
    deserializer: AnyResourceDeserializer,
): ResourceResult<AnyResourceDeserializer> => {
    const resource = included.get(`${type}:::${id}`);

    if (!resource) {
        throw new Error(`No included resource with type ${type} and ID ${id} found`);
    }

    if (resource.processed) {
        return resource.processed;
    }

    let schema = resourceSchemaCache.get(path);

    if (!schema) {
        schema = createResourceSchema(deserializer);
        resourceSchemaCache.set(path, schema);
    }

    resource.processed = flattenResource(
        schema.parse(resource.raw, { path: path.split(".") }),
        path,
        included,
        resourceSchemaCache,
    );

    return resource.processed;
};

const flattenRelationship = (
    relationship: z.output<RelationshipSchema<AnyRelationshipDeserializer>>,
    path: string,
    included: Map<string, IncludedResource>,
    resourceSchemaCache: ResourceSchemaCache,
): RelationshipResult<AnyRelationshipDeserializer> => {
    if (relationship.data === null) {
        return null;
    }

    const include =
        "include" in relationship.deserializer ? relationship.deserializer.include : null;

    if (!include) {
        if (!Array.isArray(relationship.data)) {
            return {
                id: relationship.data.id,
                _meta: relationship.data?.meta,
            } as RelationshipResult<AnyRelationshipDeserializer>;
        }

        return relationship.data.map((identifier) => ({
            id: identifier.id,
            _meta: identifier.meta,
        })) as RelationshipResult<AnyRelationshipDeserializer>;
    }

    if (!Array.isArray(relationship.data)) {
        return includeResource(
            include.type,
            relationship.data.id,
            path,
            included,
            resourceSchemaCache,
            include,
        ) as RelationshipResult<AnyRelationshipDeserializer>;
    }

    return relationship.data.map((identifier) =>
        includeResource(include.type, identifier.id, path, included, resourceSchemaCache, include),
    ) as RelationshipResult<AnyRelationshipDeserializer>;
};

const flattenResource = <TDeserializer extends AnyResourceDeserializer>(
    result: z.output<ResourceSchema<TDeserializer>>,
    parent: string | null,
    included: Map<string, IncludedResource>,
    resourceSchemaCache: ResourceSchemaCache,
): ResourceResult<TDeserializer> => {
    const flat: Record<string, unknown> = {
        id: result.id,
        ...("attributes" in result ? result.attributes : {}),
    };

    if (result.links) {
        flat.$links = result.links;
    }

    if (result.meta) {
        flat.$meta = result.meta;
    }

    if (!result.relationships) {
        return flat as unknown as ResourceResult<TDeserializer>;
    }

    for (const [field, relationship] of Object.entries(result.relationships)) {
        flat[field] = flattenRelationship(
            relationship,
            parent ? `${parent}.${field}` : field,
            included,
            resourceSchemaCache,
        );
    }

    return flat as unknown as ResourceResult<TDeserializer>;
};

export type Selector<T> = (raw: unknown) => T;

const createFlattenedDocumentFromData = <
    TData,
    TMetaSchema extends ZodTypeAny,
    TIncludeDocumentLinks extends boolean | undefined,
>(
    result: z.output<DocumentSchema<z.ZodTypeAny, TMetaSchema>>,
    data: TData,
    includeDocumentLinks: TIncludeDocumentLinks,
): DocumentResult<TData, z.output<TMetaSchema>, TIncludeDocumentLinks> => {
    const document: Record<string, unknown> = { data };

    if (result.links && includeDocumentLinks) {
        document.links = result.links;
    }

    if (result.meta) {
        document.meta = result.meta;
    }

    return document as DocumentResult<TData, z.output<TMetaSchema>, TIncludeDocumentLinks>;
};

export const createResourceSelector = <TDeserializer extends AnyResourceDeserializer>(
    deserializer: TDeserializer,
): Selector<ResourceDocumentResult<TDeserializer>> => {
    const documentSchema = createResourceDocumentSchema(deserializer);
    const resourceSchemaCache = new Map();

    return (raw: unknown) => {
        const document = documentSchema.parse(raw);
        const included = prepareIncludedMap(document);

        return createFlattenedDocumentFromData(
            document,
            flattenResource(document.data, null, included, resourceSchemaCache),
            deserializer.includeDocumentLinks,
        ) as ResourceDocumentResult<TDeserializer>;
    };
};

export const createNullableResourceSelector = <TDeserializer extends AnyResourceDeserializer>(
    deserializer: TDeserializer,
): Selector<NullableResourceDocumentResult<TDeserializer>> => {
    const documentSchema = createNullableResourceDocumentSchema(deserializer);
    const resourceSchemaCache = new Map();

    return (raw: unknown) => {
        const document = documentSchema.parse(raw);
        const included = prepareIncludedMap(document);

        return createFlattenedDocumentFromData(
            document,
            document.data === null
                ? null
                : flattenResource(document.data, null, included, resourceSchemaCache),
            deserializer.includeDocumentLinks,
        ) as NullableResourceDocumentResult<TDeserializer>;
    };
};

export const createResourceCollectionSelector = <TDeserializer extends AnyResourceDeserializer>(
    deserializer: TDeserializer,
): Selector<ResourceCollectionDocumentResult<TDeserializer>> => {
    const documentSchema = createResourceCollectionDocumentSchema(deserializer);
    const resourceSchemaCache = new Map();

    return (raw: unknown) => {
        const document = documentSchema.parse(raw);
        const included = prepareIncludedMap(document);

        return {
            ...createFlattenedDocumentFromData(
                document,
                document.data.map((resource) =>
                    flattenResource(resource, null, included, resourceSchemaCache),
                ),
                deserializer.includeDocumentLinks,
            ),
            pageParams: {
                first: parsePageParamsFromLink(document.links?.first),
                prev: parsePageParamsFromLink(document.links?.prev),
                next: parsePageParamsFromLink(document.links?.next),
                last: parsePageParamsFromLink(document.links?.last),
            },
        } as unknown as ResourceCollectionDocumentResult<TDeserializer>;
    };
};

export const createDataSelector =
    <
        TData,
        TMeta extends DefaultMeta | undefined,
        TIncludeDocumentLinks extends boolean | undefined,
    >(
        documentSelector: Selector<DocumentResult<TData, TMeta, TIncludeDocumentLinks>>,
    ): Selector<TData> =>
    (raw: unknown) =>
        documentSelector(raw).data;
