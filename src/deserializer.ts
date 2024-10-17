import type { z } from "zod";
import type { Flatten, InferPropertyType } from "./helpers.ts";
import type { PageParams } from "./pagination.ts";
import type {
    AttributesSchema,
    DefaultMeta,
    LinksSchema,
    MetaSchema,
    RootLinks,
} from "./standard-schemas.ts";

// Relationship types
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
    TInclude extends ResourceDeserializer,
> = {
    relationshipType: TRelationshipType;
    include: TInclude;
};

export type AnyIncludedRelationshipDeserializer = IncludedRelationshipDeserializer<
    RelationshipType,
    ResourceDeserializer
>;

export type AnyRelationshipDeserializer =
    | AnyReferenceRelationshipDeserializer
    | AnyIncludedRelationshipDeserializer;

export type Relationships = Record<string, AnyRelationshipDeserializer>;

export type InferRelationshipResourceType<T extends AnyRelationshipDeserializer> =
    T extends AnyReferenceRelationshipDeserializer
        ? T["resourceType"]
        : T extends AnyIncludedRelationshipDeserializer
          ? T["include"]["type"]
          : never;

// Resource types
export type ResourceDeserializer<
    TType extends string = string,
    TAttributesSchema extends AttributesSchema | undefined = undefined,
    TRelationships extends Relationships | undefined = undefined,
    TLinksSchema extends LinksSchema | undefined = undefined,
    TMetaSchema extends MetaSchema | undefined = undefined,
    TDocumentMetaSchema extends MetaSchema | undefined = undefined,
    TIncludeDocumentLinks extends boolean | undefined = undefined,
> = {
    type: TType;
    attributesSchema?: TAttributesSchema;
    relationships?: TRelationships;
    linksSchema?: TLinksSchema;
    metaSchema?: TMetaSchema;
    documentMetaSchema?: TDocumentMetaSchema;
    includeDocumentLinks?: TIncludeDocumentLinks;
};

export type AnyResourceDeserializer = ResourceDeserializer<
    string,
    AttributesSchema | undefined,
    Relationships | undefined,
    LinksSchema | undefined,
    MetaSchema | undefined,
    MetaSchema | undefined,
    boolean | undefined
>;

type IncludeResult<TDeserializer extends AnyRelationshipDeserializer> =
    TDeserializer extends AnyIncludedRelationshipDeserializer
        ? ResourceResult<TDeserializer["include"]>
        : { id: string };

export type RelationshipResult<
    TDeserializer extends AnyRelationshipDeserializer,
    TRelationshipType extends RelationshipType = TDeserializer["relationshipType"],
> = TRelationshipType extends "one"
    ? IncludeResult<TDeserializer>
    : TRelationshipType extends "one_nullable"
      ? IncludeResult<TDeserializer> | null
      : IncludeResult<TDeserializer>[];

type RelationshipsResult<T extends Relationships> = {
    [K in keyof T]: RelationshipResult<T[K]>;
};

type AppendAttributes<
    TDeserializer extends AnyResourceDeserializer,
    TBase,
    TAttributesSchema extends AttributesSchema | undefined = InferPropertyType<
        TDeserializer,
        "attributesSchema"
    >,
> = TAttributesSchema extends AttributesSchema ? TBase & z.output<TAttributesSchema> : TBase;

type AppendRelationships<
    TDeserializer extends AnyResourceDeserializer,
    TBase,
    TRelationships extends Relationships | undefined = InferPropertyType<
        TDeserializer,
        "relationships"
    >,
> = TRelationships extends Relationships ? TBase & RelationshipsResult<TRelationships> : TBase;

type AppendLinks<
    TDeserializer extends AnyResourceDeserializer,
    TBase,
    TLinksSchema extends LinksSchema | undefined = InferPropertyType<TDeserializer, "linksSchema">,
> = TLinksSchema extends LinksSchema ? TBase & { $links: z.output<TLinksSchema> } : TBase;

type AppendMeta<
    TDeserializer extends AnyResourceDeserializer,
    TBase,
    TMetaSchema extends MetaSchema | undefined = InferPropertyType<TDeserializer, "metaSchema">,
> = TMetaSchema extends MetaSchema ? TBase & { $meta: z.output<TMetaSchema> } : TBase;

export type ResourceResult<TDeserializer extends AnyResourceDeserializer> = Flatten<
    AppendAttributes<
        TDeserializer,
        AppendRelationships<
            TDeserializer,
            AppendLinks<TDeserializer, AppendMeta<TDeserializer, { id: string }>>
        >
    >
>;

// Document types
type MetaResult<TMetaSchema extends MetaSchema | undefined> = TMetaSchema extends MetaSchema
    ? z.output<TMetaSchema>
    : undefined;

type AppendDocumentMeta<TMeta extends DefaultMeta | undefined, TBase> = TMeta extends DefaultMeta
    ? TBase & { meta: TMeta }
    : TBase;

type AppendDocumentLinks<
    TIncludeDocumentLinks extends boolean | undefined,
    TBase,
> = TIncludeDocumentLinks extends true ? TBase & { links: RootLinks } : TBase;

export type DocumentResult<
    TData,
    TMeta extends DefaultMeta | undefined,
    TIncludeDocumentLinks extends boolean | undefined,
> = AppendDocumentLinks<TIncludeDocumentLinks, AppendDocumentMeta<TMeta, { data: TData }>>;
export type ResourceDocumentResult<TDeserializer extends AnyResourceDeserializer> = DocumentResult<
    ResourceResult<TDeserializer>,
    MetaResult<InferPropertyType<TDeserializer, "documentMetaSchema">>,
    InferPropertyType<TDeserializer, "includeDocumentLinks">
>;
export type NullableResourceDocumentResult<TDeserializer extends AnyResourceDeserializer> =
    DocumentResult<
        ResourceResult<TDeserializer> | null,
        MetaResult<InferPropertyType<TDeserializer, "documentMetaSchema">>,
        InferPropertyType<TDeserializer, "includeDocumentLinks">
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
        MetaResult<InferPropertyType<TDeserializer, "documentMetaSchema">>,
        InferPropertyType<TDeserializer, "includeDocumentLinks">
    > & {
        pageParams: CollectionPageParams;
    };
