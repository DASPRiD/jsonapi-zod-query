import { z } from "zod";
import { type InferredMetaSchema, defaultMetaSchema, linkSchema } from "./common.ts";

const linksSchema = z.object({
    self: linkSchema.optional(),
    related: linkSchema.optional(),
    describedby: linkSchema.optional(),
    first: linkSchema.optional().nullable(),
    prev: linkSchema.optional().nullable(),
    next: linkSchema.optional().nullable(),
    last: linkSchema.optional().nullable(),
});

type CreateDataDocumentSchemaOptions<
    DataSchema extends z.ZodType<unknown>,
    MetaSchema extends z.ZodType<unknown> | undefined,
> = {
    dataSchema: DataSchema;
    metaSchema: MetaSchema;
};

export type DataDocumentSchema<
    DataSchema extends z.ZodType<unknown>,
    MetaSchema extends z.ZodType<unknown>,
> = z.ZodObject<{
    data: DataSchema;
    meta: MetaSchema;
    links: z.ZodOptional<typeof linksSchema>;
}>;

export const createDataDocumentSchema = <
    DataSchema extends z.ZodType<unknown>,
    MetaSchema extends z.ZodType<unknown> | undefined,
>(
    options: CreateDataDocumentSchemaOptions<DataSchema, MetaSchema>,
): DataDocumentSchema<DataSchema, InferredMetaSchema<MetaSchema>> => {
    return z.object({
        data: options.dataSchema,
        meta: (options.metaSchema ??
            defaultMetaSchema.optional()) as InferredMetaSchema<MetaSchema>,
        links: linksSchema.optional(),
    });
};
