import { z } from "zod";

export const defaultMetaSchema = z.record(z.unknown());
export type MetaSchema = z.ZodTypeAny;
export type DefaultMeta = z.output<typeof defaultMetaSchema>;

const linkObjectSchema = z.object({
    href: z.string(),
    rel: z.string().optional(),
    describedby: z.string().url().optional(),
    title: z.string().optional(),
    type: z.string().optional(),
    hreflang: z.string().optional(),
    meta: defaultMetaSchema.optional(),
});

export const linkSchema = linkObjectSchema.or(z.string()).nullable().optional();
export type Link = z.output<typeof linkSchema>;

export const defaultLinksSchema = z.record(linkSchema);
export type DefaultLinks = z.output<typeof defaultLinksSchema>;

export const rootLinksSchema = z.object({
    self: linkSchema,
    related: linkSchema,
    describedby: linkSchema,
    first: linkSchema,
    prev: linkSchema,
    next: linkSchema,
    last: linkSchema,
});
export type RootLinks = z.output<typeof rootLinksSchema>;

export type AttributesSchema = z.ZodTypeAny;
