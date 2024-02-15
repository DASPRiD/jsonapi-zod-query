import type { z } from "zod";
import type { PageParams } from "./pagination.ts";
import type { AttributesSchema, DefaultLinks, DefaultMeta, RootLinks } from "./standard-schemas.ts";

export type RelationshipType = "one" | "one_nullable" | "many";

export type RelationshipDeserializer<
    TResourceType extends string,
    TRelationshipType extends RelationshipType,
    TInclude extends AnyResourceDeserializer | undefined,
> = TInclude extends undefined
    ? {
          relationshipType: TRelationshipType;
          resourceType: TResourceType;
      }
    : {
          relationshipType: TRelationshipType;
          include: TInclude;
      };

export type AnyRelationshipDeserializer = RelationshipDeserializer<
    string,
    RelationshipType,
    // biome-ignore lint/suspicious/noExplicitAny: required to avoid circular dependency error
    ResourceDeserializer<string, AttributesSchema | undefined, any> | undefined
>;

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

export type InferResourceType<T> = T extends RelationshipDeserializer<
    infer U,
    RelationshipType,
    AnyResourceDeserializer | undefined
>
    ? U
    : never;
export type InferRelationshipType<T> = T extends RelationshipDeserializer<
    string,
    infer U,
    AnyResourceDeserializer | undefined
>
    ? U
    : never;
export type InferInclude<T> = T extends RelationshipDeserializer<string, RelationshipType, infer U>
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

type IncludeResult<
    TDeserializer extends AnyRelationshipDeserializer,
    TInclude extends AnyResourceDeserializer | undefined = InferInclude<TDeserializer>,
> = TInclude extends AnyResourceDeserializer ? ResourceResult<TInclude> : { id: string };

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
            first?: PageParams | null;
            prev?: PageParams | null;
            next?: PageParams | null;
            last?: PageParams | null;
        };
    };
