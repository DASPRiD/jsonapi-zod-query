import { z } from "zod";
import { defaultMetaSchema } from "./common.ts";

const jsonApiErrorSchema = z.object({
    id: z.string().optional(),
    links: z
        .object({
            about: z.string().optional(),
            type: z.string().optional(),
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
        public readonly errors: Array<z.output<typeof jsonApiErrorSchema>>,
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

    const result = jsonApiErrorDocumentSchema.safeParse((await response.json()) as unknown);

    if (!result.success) {
        throw new JsonApiError(`Failed to perform request to ${response.url}`, response.status, []);
    }

    throw new JsonApiError(
        `Failed to perform request to ${response.url}`,
        response.status,
        result.data.errors,
    );
};
