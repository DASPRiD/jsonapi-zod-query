import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
    createDataSelector,
    createNullableResourceSelector,
    createResourceCollectionSelector,
    createResourceSelector,
    type Relationships,
} from "../src/index.js";

describe("createResourceSelector", () => {
    it("should parse simple resource", () => {
        const selector = createResourceSelector({
            type: "article",
            attributesSchema: z.object({ title: z.string() }),
        });

        const result = selector({
            data: {
                id: "ID-p",
                type: "article",
                attributes: { title: "foo" },
            },
        });

        expect(result).toEqual({
            data: {
                id: "ID-p",
                title: "foo",
            },
        });
    });

    it("should allow specifying document meta schemas", () => {
        const selector = createResourceSelector({
            type: "article",
            documentMetaSchema: z.object({
                foo: z.string(),
            }),
        });

        const result = selector({
            data: {
                id: "ID-p",
                type: "article",
            },
            meta: {
                foo: "bar",
            },
        });

        expect(result).toEqual({
            data: {
                id: "ID-p",
            },
            meta: {
                foo: "bar",
            },
        });
    });

    it("should parse identifier relationship", () => {
        const selector = createResourceSelector({
            type: "article",
            relationships: {
                author: {
                    resourceType: "person",
                    relationshipType: "one",
                },
            },
        });

        const result = selector({
            data: {
                id: "ID-p",
                type: "article",
                relationships: {
                    author: { data: { id: "ID-r", type: "person" } },
                },
            },
        });

        expect(result).toEqual({
            data: {
                id: "ID-p",
                author: {
                    id: "ID-r",
                },
            },
        });
    });

    it("should include identifier relationship", () => {
        const selector = createResourceSelector({
            type: "article",
            relationships: {
                author: {
                    relationshipType: "one",
                    include: {
                        type: "person",
                        attributesSchema: z.object({
                            name: z.string(),
                        }),
                    },
                },
            },
        });

        const result = selector({
            data: {
                id: "ID-p",
                type: "article",
                relationships: {
                    author: { data: { id: "ID-r", type: "person" } },
                },
            },
            included: [
                {
                    type: "person",
                    id: "ID-r",
                    attributes: { name: "John" },
                },
            ],
        });

        expect(result).toEqual({
            data: {
                id: "ID-p",
                author: {
                    id: "ID-r",
                    name: "John",
                },
            },
        });
    });

    it("should support nested relationships", () => {
        const selector = createResourceSelector({
            type: "article",
            relationships: {
                author: {
                    resourceType: "person",
                    relationshipType: "one",
                    include: {
                        type: "person",
                        relationships: {
                            profile: {
                                relationshipType: "one",
                                include: {
                                    type: "profile",
                                    attributesSchema: z.object({
                                        emailAddress: z.string(),
                                    }),
                                },
                            },
                        } satisfies Relationships,
                    },
                },
            },
        });

        const result = selector({
            data: {
                id: "ID-p",
                type: "article",
                relationships: {
                    author: { data: { id: "ID-r", type: "person" } },
                },
            },
            included: [
                {
                    type: "person",
                    id: "ID-r",
                    relationships: {
                        profile: { data: { id: "ID-s", type: "profile" } },
                    },
                },
                {
                    type: "profile",
                    id: "ID-s",
                    attributes: {
                        emailAddress: "john@example.com",
                    },
                },
            ],
        });

        expect(result).toEqual({
            data: {
                id: "ID-p",
                author: {
                    id: "ID-r",
                    profile: {
                        id: "ID-s",
                        emailAddress: "john@example.com",
                    },
                },
            },
        });
    });
});

describe("createNullableResourceSelector", () => {
    it("should allow null", () => {
        const selector = createNullableResourceSelector({
            type: "article",
        });

        const result = selector({
            data: null,
        });

        expect(result).toEqual({
            data: null,
        });
    });
});

describe("createResourceCollectionSelector", () => {
    it("should return page params", () => {
        const selector = createResourceCollectionSelector({
            type: "article",
        });

        const result = selector({
            data: [
                { id: "1", type: "article" },
                { id: "2", type: "article" },
            ],
            links: {
                next: "/?page[number]=2",
            },
        });

        expect(result).toEqual({
            data: [{ id: "1" }, { id: "2" }],
            pageParams: {
                next: { number: "2" },
            },
        });
    });

    it("should include document links when enabled", () => {
        const selector = createResourceCollectionSelector({
            type: "article",
            includeDocumentLinks: true,
        });

        const result = selector({
            data: [
                { id: "1", type: "article" },
                { id: "2", type: "article" },
            ],
            links: {
                next: "/?page[number]=2",
            },
        });

        expect(result).toEqual({
            data: [{ id: "1" }, { id: "2" }],
            links: {
                next: "/?page[number]=2",
            },
            pageParams: {
                next: { number: "2" },
            },
        });
    });
});

describe("createDataSelector", () => {
    it("should extract data", () => {
        const selector = createDataSelector(
            createResourceSelector({
                type: "article",
                attributesSchema: z.object({ title: z.string() }),
            }),
        );

        const result = selector({
            data: {
                id: "ID-p",
                type: "article",
                attributes: { title: "foo" },
            },
        });

        expect(result).toEqual({
            id: "ID-p",
            title: "foo",
        });
    });
});
