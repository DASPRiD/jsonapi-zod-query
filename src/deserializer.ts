import type { z } from "zod";
import type { PageParams } from "./pagination.ts";
import type { defaultMetaSchema } from "./standard-schemas.ts";
import type {
    AttributesSchema,
    DefaultLinks,
    DefaultMeta,
    MetaSchema,
    RootLinks,
} from "./standard-schemas.ts";

export type RelationshipType = "one" | "one_nullable" | "many";

export type ReferenceRelationshipDeserializer<
    TRelationshipType extends RelationshipType,
    TResourceType extends string,
> = {
    relationshipType: TRelationshipType;
    resourceType: TResourceType;
};

export type AnyReferenceRelationshipDeserializer = ReferenceRelationshipDeserializer<
    RelationshipType,
    string
>;

export type IncludedRelationshipDeserializer<
    TRelationshipType extends RelationshipType,
    TInclude extends AnyResourceDeserializer,
> = {
    relationshipType: TRelationshipType;
    include: TInclude;
};

export type AnyIncludedRelationshipDeserializer = IncludedRelationshipDeserializer<
    RelationshipType,
    // biome-ignore lint/suspicious/noExplicitAny: required to avoid circular dependency
    any
>;

export type AnyRelationshipDeserializer =
    | AnyReferenceRelationshipDeserializer
    | AnyIncludedRelationshipDeserializer;

export type Relationships = Record<string, AnyRelationshipDeserializer>;

export type ResourceDeserializer<
    TType extends string = string,
    TAttributesSchema extends AttributesSchema | undefined = undefined,
    TRelationships extends Relationships | undefined = undefined,
    TDocumentMetaSchema extends MetaSchema | undefined = undefined,
> = {
    type: TType;
    attributesSchema?: TAttributesSchema;
    relationships?: TRelationships;
    documentMetaSchema?: TDocumentMetaSchema;
};

export type AnyResourceDeserializer = ResourceDeserializer<
    string,
    AttributesSchema | undefined,
    Relationships | undefined,
    MetaSchema | undefined
>;

export type InferResourceType<T> = T extends ReferenceRelationshipDeserializer<
    RelationshipType,
    infer U
>
    ? U
    : T extends IncludedRelationshipDeserializer<infer U, AnyResourceDeserializer>
      ? U extends AnyResourceDeserializer
            ? U["type"]
            : never
      : never;
export type InferRelationshipType<T> = T extends ReferenceRelationshipDeserializer<infer U, string>
    ? U
    : T extends IncludedRelationshipDeserializer<infer U, AnyResourceDeserializer>
      ? U
      : never;
export type InferInclude<T> = T extends IncludedRelationshipDeserializer<RelationshipType, infer U>
    ? U
    : never;
export type InferType<T> = T extends ResourceDeserializer<
    infer U,
    AttributesSchema | undefined,
    Relationships | undefined,
    MetaSchema | undefined
>
    ? U
    : never;
type IsUndefined<T> = undefined extends T ? true : false;
export type InferAttributesSchema<T> = T extends ResourceDeserializer<
    string,
    infer U,
    Relationships | undefined,
    MetaSchema | undefined
>
    ? IsUndefined<U> extends true
        ? undefined
        : U
    : never;
export type InferRelationships<T> = T extends ResourceDeserializer<
    string,
    AttributesSchema | undefined,
    infer U,
    MetaSchema | undefined
>
    ? IsUndefined<U> extends true
        ? undefined
        : U
    : never;
export type InferDocumentMetaSchema<T> = T extends ResourceDeserializer<
    string,
    AttributesSchema | undefined,
    Relationships | undefined,
    infer U
>
    ? IsUndefined<U> extends true
        ? undefined
        : U
    : never;

type IncludeResult<TDeserializer extends AnyRelationshipDeserializer> =
    TDeserializer extends AnyReferenceRelationshipDeserializer
        ? { id: string }
        : ResourceResult<InferInclude<TDeserializer>>;

export type RelationshipResult<
    TDeserializer extends AnyRelationshipDeserializer,
    TRelationshipType extends RelationshipType = InferRelationshipType<TDeserializer>,
> = TRelationshipType extends "one"
    ? IncludeResult<TDeserializer>
    : TRelationshipType extends "one_nullable"
      ? IncludeResult<TDeserializer> | null
      : IncludeResult<TDeserializer>[];

type RelationshipsResult<T extends Relationships> = {
    [K in keyof T]: RelationshipResult<T[K]>;
};

type AppendAttributes<
    TBase,
    TAttributesSchema extends AttributesSchema | undefined,
> = TAttributesSchema extends AttributesSchema ? TBase & z.output<TAttributesSchema> : TBase;

type AppendRelationships<
    TBase,
    TRelationships extends Relationships | undefined,
> = TRelationships extends Relationships ? TBase & RelationshipsResult<TRelationships> : TBase;

export type ResourceResult<
    TDeserializer extends AnyResourceDeserializer,
    TAttributesSchema extends AttributesSchema | undefined = InferAttributesSchema<TDeserializer>,
    TRelationships extends Relationships | undefined = InferRelationships<TDeserializer>,
> = AppendRelationships<
    AppendAttributes<
        {
            id: string;
            _links?: DefaultLinks;
            _meta?: DefaultMeta;
        },
        TAttributesSchema
    >,
    TRelationships
>;

export type FallbackMetaSchema<T extends MetaSchema> = T extends MetaSchema
    ? MetaSchema
    : z.ZodOptional<typeof defaultMetaSchema>;

type MetaResult<TMeta extends MetaSchema | undefined> = TMeta extends MetaSchema
    ? z.output<TMeta>
    : DefaultMeta | undefined;

export type DocumentResult<TData, TMeta> = {
    data: TData;
    links?: RootLinks;
    meta: TMeta;
};
export type ResourceDocumentResult<TDeserializer extends AnyResourceDeserializer> = DocumentResult<
    ResourceResult<TDeserializer>,
    MetaResult<InferDocumentMetaSchema<TDeserializer>>
>;
export type NullableResourceDocumentResult<TDeserializer extends AnyResourceDeserializer> =
    DocumentResult<
        ResourceResult<TDeserializer> | null,
        MetaResult<InferDocumentMetaSchema<TDeserializer>>
    >;
export type CollectionPageParams = {
    first?: PageParams;
    prev?: PageParams;
    next?: PageParams;
    last?: PageParams;
};
export type ResourceCollectionDocumentResult<TDeserializer extends AnyResourceDeserializer> =
    DocumentResult<
        ResourceResult<TDeserializer>[],
        MetaResult<InferDocumentMetaSchema<TDeserializer>>
    > & {
        pageParams: CollectionPageParams;
    };
