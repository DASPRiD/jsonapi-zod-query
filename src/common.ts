import { z } from "zod";

export const defaultMetaSchema = z.record(z.unknown());

export type InferredMetaSchema<MetaSchema extends z.ZodType<unknown> | undefined> =
    MetaSchema extends z.ZodType<unknown> ? MetaSchema : z.ZodOptional<typeof defaultMetaSchema>;

const linkObjectSchema = z.object({
    href: z.string().url(),
    rel: z.string().optional(),
    describedby: z.string().url().optional(),
    title: z.string().optional(),
    type: z.string().optional(),
    hreflang: z.string().optional(),
    meta: defaultMetaSchema.optional(),
});

export const linkSchema = linkObjectSchema.or(z.string().url());
export type Link = z.output<typeof linkSchema>;
