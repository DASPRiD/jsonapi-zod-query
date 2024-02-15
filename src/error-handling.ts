import { z } from "zod";
import { type DefaultMeta, defaultMetaSchema, linkSchema } from "./standard-schemas.ts";

const jsonApiErrorSchema = z.object({
    id: z.string().optional(),
    links: z
        .object({
            about: linkSchema,
            type: linkSchema,
        })
        .optional(),
    status: z.string(),
    code: z.string().optional(),
    title: z.string().optional(),
    detail: z.string().optional(),
    source: z
        .object({
            pointer: z.string().optional(),
            parameter: z.string().optional(),
            header: z.string().optional(),
        })
        .optional(),
    meta: z.record(z.unknown()).optional(),
});

const jsonApiErrorDocumentSchema = z.object({
    errors: z.array(jsonApiErrorSchema),
    meta: defaultMetaSchema.optional(),
});

export class JsonApiError extends Error {
    public constructor(
        message: string,
        public readonly status: number,
        public readonly errors: z.output<typeof jsonApiErrorSchema>[],
        public readonly meta?: DefaultMeta,
    ) {
        super(message);
    }
}

/**
 * Handle any non-successful response and throw a `JsonApiError`
 *
 * If the response was successful, a call to this function is a no-op.
 */
export const handleJsonApiError = async (response: Response) => {
    if (response.ok) {
        return;
    }

    if (!response.headers.get("Content-Type")?.startsWith("application/vnd.api+json")) {
        throw new Error("Failed to parse error response, invalid content type");
    }

    const result = jsonApiErrorDocumentSchema.parse((await response.json()) as unknown);

    throw new JsonApiError(
        `Failed to perform request to ${response.url}`,
        response.status,
        result.errors,
        result.meta,
    );
};
