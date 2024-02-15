import { describe, expect, it } from "vitest";
import { handleJsonApiError } from "../src/index.js";

describe("handleJsonApiError", () => {
    it("should do nothing on successful response", async () => {
        const response = new Response(null, { status: 204 });
        await handleJsonApiError(response);
    });

    it("should throw on non-json-api response", async () => {
        const response = new Response(null, { status: 400 });
        await expect(() => handleJsonApiError(response)).rejects.toThrow(
            "Failed to parse error response, invalid content type",
        );
    });

    it("should throw on invalid json-api response", async () => {
        const response = new Response(JSON.stringify({}), {
            status: 400,
            headers: { "Content-Type": "application/vnd.api+json" },
        });
        await expect(() => handleJsonApiError(response)).rejects.toThrow();
    });

    it("should throw JsonApiError", async () => {
        const response = new Response(
            JSON.stringify({
                errors: [{ status: "400" }],
            }),
            { status: 400, headers: { "Content-Type": "application/vnd.api+json" } },
        );
        await expect(() => handleJsonApiError(response)).rejects.toThrow(
            "Failed to perform request to",
        );
    });
});
