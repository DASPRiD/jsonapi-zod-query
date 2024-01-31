import type { z } from "zod";
import { type InferredMetaSchema, defaultMetaSchema } from "./common.ts";
import { type DataDocumentSchema, createDataDocumentSchema } from "./data-document.ts";

type DataSelector<DataSchema extends z.ZodType<unknown>> = (raw: unknown) => z.output<DataSchema>;

/**
 * Create a selector which only extracts `data` from a document
 */
export const createDataSelector = <DataSchema extends z.ZodType<unknown>>(
    dataSchema: DataSchema,
): DataSelector<DataSchema> => {
    const documentSchema = createDataDocumentSchema({
        dataSchema,
        metaSchema: defaultMetaSchema,
    });

    return (raw: unknown) => {
        const document = documentSchema.parse(raw);
        return document.data;
    };
};

type ComplexTransformer<
    DataSchema extends z.ZodType<unknown>,
    MetaSchema extends z.ZodType<unknown>,
    Result,
> = (document: z.output<DataDocumentSchema<DataSchema, MetaSchema>>) => Result;

type CreateComplexSelectorOptions<
    DataSchema extends z.ZodType<unknown>,
    MetaSchema extends z.ZodType<unknown> | undefined,
    Result,
> = {
    dataSchema: DataSchema;
    metaSchema?: MetaSchema;
    transformer: ComplexTransformer<DataSchema, InferredMetaSchema<MetaSchema>, Result>;
};

type ComplexApiSelector<Result> = (raw: unknown) => Result;

/**
 * Create a selector which extracts additional information through a transformer
 */
export const createComplexSelector = <
    DataSchema extends z.ZodType<unknown>,
    MetaSchema extends z.ZodType<unknown> | undefined,
    Result,
>(
    options: CreateComplexSelectorOptions<DataSchema, MetaSchema, Result>,
): ComplexApiSelector<Result> => {
    const documentSchema = createDataDocumentSchema({
        dataSchema: options.dataSchema,
        metaSchema: options.metaSchema ?? defaultMetaSchema,
    });

    return (raw: unknown) => {
        const document = documentSchema.parse(raw) as z.output<
            DataDocumentSchema<DataSchema, InferredMetaSchema<MetaSchema>>
        >;
        return options.transformer(document);
    };
};
