import type { z } from "zod";
import type { PageParams } from "./pagination.ts";
import type { AttributesSchema, DefaultLinks, DefaultMeta, RootLinks } from "./standard-schemas.ts";

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
    TType extends string,
    TAttributesSchema extends AttributesSchema | undefined,
    TRelationships extends Relationships | undefined,
> = {
    type: TType;
    attributesSchema?: TAttributesSchema;
    relationships?: TRelationships;
};

export type AnyResourceDeserializer = ResourceDeserializer<
    string,
    AttributesSchema | undefined,
    Relationships | undefined
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
    Relationships | undefined
>
    ? U
    : never;
export type InferAttributesSchema<T> = T extends ResourceDeserializer<
    string,
    infer U,
    Relationships | undefined
>
    ? U
    : never;
export type InferRelationships<T> = T extends ResourceDeserializer<
    string,
    AttributesSchema | undefined,
    infer U
>
    ? U
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

export type ResourceResult<
    TDeserializer extends AnyResourceDeserializer,
    TAttributesSchema extends AttributesSchema | undefined = InferAttributesSchema<TDeserializer>,
    TRelationships extends Relationships | undefined = InferRelationships<TDeserializer>,
> = {
    id: string;
    _links?: DefaultLinks;
    _meta?: DefaultMeta;
} & (TAttributesSchema extends AttributesSchema
    ? z.output<TAttributesSchema>
    : Record<string, never>) &
    (TRelationships extends Relationships
        ? RelationshipsResult<TRelationships>
        : Record<string, never>);

export type DocumentResult<TData> = {
    data: TData;
    links?: RootLinks;
    meta?: DefaultMeta;
};
export type ResourceDocumentResult<TDeserializer extends AnyResourceDeserializer> = DocumentResult<
    ResourceResult<TDeserializer>
>;
export type NullableResourceDocumentResult<TDeserializer extends AnyResourceDeserializer> =
    DocumentResult<ResourceResult<TDeserializer> | null>;
export type ResourceCollectionDocumentResult<TDeserializer extends AnyResourceDeserializer> =
    DocumentResult<ResourceResult<TDeserializer>[]> & {
        pageParams: {
            first?: PageParams;
            prev?: PageParams;
            next?: PageParams;
            last?: PageParams;
        };
    };
