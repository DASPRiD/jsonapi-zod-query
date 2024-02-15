import { describe, expect, it } from "vitest";
import { injectPageParams, parsePageParamsFromLink } from "../src/index.js";

describe("parsePageParams", () => {
    it("should return falsy link", () => {
        expect(parsePageParamsFromLink(undefined)).toBeUndefined();
        expect(parsePageParamsFromLink(null)).toBeNull();
    });

    it("should throw when not finding page params", () => {
        expect(() => parsePageParamsFromLink("https://example.com/")).toThrow(
            "No page params found in link https://example.com/",
        );
    });

    it("should only extract page params", () => {
        expect(parsePageParamsFromLink("https://example.com/?page[number]=2&filter=foo")).toEqual({
            number: "2",
        });
    });

    it("should allow relative links", () => {
        expect(parsePageParamsFromLink("/?page[number]=2&filter=foo")).toEqual({
            number: "2",
        });
    });

    it("should parse link object", () => {
        expect(parsePageParamsFromLink({ href: "/?page[number]=2&filter=foo" })).toEqual({
            number: "2",
        });
    });
});

describe("injectPageParams", () => {
    it("should do nothing without page params", () => {
        const url = new URL("http://example.com/");
        injectPageParams(url);

        expect(url.toString()).toEqual("http://example.com/");
    });

    it("should inject all page params", () => {
        const url = new URL("http://example.com/");
        injectPageParams(url, { limit: "10", number: "2" });

        expect(decodeURI(url.toString())).toEqual(
            "http://example.com/?page[limit]=10&page[number]=2",
        );
    });
});
