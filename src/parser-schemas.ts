import { z } from "zod";
import type { FallbackMetaSchema, InferDocumentMetaSchema } from "./deserializer.ts";
import type {
    AnyRelationshipDeserializer,
    AnyResourceDeserializer,
    InferAttributesSchema,
    InferRelationshipType,
    InferRelationships,
    InferResourceType,
    InferType,
    RelationshipType,
    Relationships,
} from "./deserializer.ts";
import {
    type AttributesSchema,
    type DefaultLinks,
    type DefaultMeta,
    type RootLinks,
    defaultLinksSchema,
    defaultMetaSchema,
    rootLinksSchema,
} from "./standard-schemas.ts";

type RelationshipIdentifierSchema<TType extends string> = z.ZodType<{
    id: string;
    type: TType;
    meta?: DefaultMeta;
}>;

type RelationshipDataSchema<
    TDeserializer extends AnyRelationshipDeserializer,
    TRelationshipType extends RelationshipType = InferRelationshipType<TDeserializer>,
    TResourceType extends string = InferResourceType<TDeserializer>,
> = TRelationshipType extends "one"
    ? RelationshipIdentifierSchema<TResourceType>
    : TRelationshipType extends "one_nullable"
      ? z.ZodNullable<RelationshipIdentifierSchema<TResourceType>>
      : z.ZodArray<RelationshipIdentifierSchema<TResourceType>>;

export type RelationshipSchema<TDeserializer extends AnyRelationshipDeserializer> = z.ZodType<{
    links?: DefaultLinks;
    meta?: DefaultMeta;
    data: z.output<RelationshipDataSchema<TDeserializer>>;
    deserializer: TDeserializer;
}>;

const createRelationshipSchema = <TDeserializer extends AnyRelationshipDeserializer>(
    deserializer: TDeserializer,
): RelationshipSchema<TDeserializer> => {
    const type =
        "resourceType" in deserializer ? deserializer.resourceType : deserializer.include.type;

    const identifierSchema = z.object({
        id: z.string(),
        type: z.literal(type),
        meta: defaultMetaSchema.optional(),
    });

    let dataSchema: z.ZodTypeAny;

    switch (deserializer.relationshipType) {
        case "one": {
            dataSchema = identifierSchema;
            break;
        }

        case "one_nullable": {
            dataSchema = identifierSchema.nullable();
            break;
        }

        case "many": {
            dataSchema = z.array(identifierSchema);
            break;
        }
    }

    return z
        .object({
            links: defaultLinksSchema.optional(),
            meta: defaultMetaSchema.optional(),
            data: dataSchema as RelationshipDataSchema<TDeserializer>,
        })
        .transform((result) => ({
            ...result,
            deserializer,
        })) as unknown as RelationshipSchema<TDeserializer>;
};

type RelationshipsSchema<TRelationships extends Relationships> = z.ZodObject<{
    [K in keyof TRelationships]: RelationshipSchema<TRelationships[K]>;
}>;

const createRelationshipsSchema = <TRelationships extends Relationships>(
    relationships: TRelationships,
): RelationshipsSchema<TRelationships> =>
    z.object(
        Object.fromEntries(
            Object.entries(relationships).map(([field, deserializer]) => [
                field,
                createRelationshipSchema(deserializer),
            ]),
        ),
    ) as RelationshipsSchema<TRelationships>;

export type ResourceSchema<
    TDeserializer extends AnyResourceDeserializer,
    TAttributesSchema extends AttributesSchema | undefined = InferAttributesSchema<TDeserializer>,
    TRelationships extends Relationships | undefined = InferRelationships<TDeserializer>,
> = z.ZodType<{
    id: string;
    type: InferType<TDeserializer>;
    links?: DefaultLinks;
    meta?: DefaultMeta;
    attributes: TAttributesSchema extends AttributesSchema ? z.output<TAttributesSchema> : never;
    relationships: TRelationships extends Relationships
        ? z.output<RelationshipsSchema<TRelationships>>
        : never;
}>;

export const createResourceSchema = <TDeserializer extends AnyResourceDeserializer>(
    deserializer: TDeserializer,
): ResourceSchema<TDeserializer> => {
    const rawShape: z.ZodRawShape = {
        id: z.string(),
        type: z.literal(deserializer.type),
        links: defaultLinksSchema.optional(),
        meta: defaultMetaSchema.optional(),
    };

    if (deserializer.attributesSchema) {
        rawShape.attributes = deserializer.attributesSchema;
    }

    if (deserializer.relationships) {
        rawShape.relationships = createRelationshipsSchema(deserializer.relationships);
    }

    return z.object(rawShape) as unknown as ResourceSchema<TDeserializer>;
};

const includedResourceSchema = z
    .object({
        id: z.string(),
        type: z.string(),
    })
    .passthrough();

const includedSchema = z.array(includedResourceSchema);

type BaseDocumentOutput = {
    links?: RootLinks;
    included?: z.output<typeof includedSchema>;
};

export type DocumentSchema<
    TDataSchema extends z.ZodTypeAny,
    TMetaSchema extends z.ZodTypeAny,
> = z.ZodType<
    BaseDocumentOutput & {
        data: z.output<TDataSchema>;
    } & (z.output<TMetaSchema> extends undefined
            ? {
                  meta?: z.output<TMetaSchema>;
              }
            : { meta: z.output<TMetaSchema> })
>;

export const createResourceDocumentSchema = <TDeserializer extends AnyResourceDeserializer>(
    deserializer: TDeserializer,
): DocumentSchema<
    ResourceSchema<TDeserializer>,
    FallbackMetaSchema<InferDocumentMetaSchema<TDeserializer>>
> =>
    z.object({
        data: createResourceSchema(deserializer),
        links: rootLinksSchema.optional(),
        meta: deserializer.documentMetaSchema ?? defaultMetaSchema.optional(),
        included: includedSchema.optional(),
    });

export const createNullableResourceDocumentSchema = <TDeserializer extends AnyResourceDeserializer>(
    deserializer: TDeserializer,
): DocumentSchema<
    z.ZodNullable<ResourceSchema<TDeserializer>>,
    FallbackMetaSchema<InferDocumentMetaSchema<TDeserializer>>
> =>
    z.object({
        data: createResourceSchema(deserializer).nullable(),
        links: rootLinksSchema.optional(),
        meta: deserializer.documentMetaSchema ?? defaultMetaSchema.optional(),
        included: includedSchema.optional(),
    });

export const createResourceCollectionDocumentSchema = <
    TDeserializer extends AnyResourceDeserializer,
>(
    deserializer: TDeserializer,
): DocumentSchema<
    z.ZodArray<ResourceSchema<TDeserializer>>,
    FallbackMetaSchema<InferDocumentMetaSchema<TDeserializer>>
> =>
    z.object({
        data: z.array(createResourceSchema(deserializer)),
        links: rootLinksSchema.optional(),
        meta: deserializer.documentMetaSchema ?? defaultMetaSchema.optional(),
        included: includedSchema.optional(),
    });
