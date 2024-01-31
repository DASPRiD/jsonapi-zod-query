import type { Link } from "./common.ts";

const pageParamRegexp = /^page\[([a-zA-Z0-9]+)]$/;
export type PageParams = Record<string, string>;

/**
 * Parse page params from a link
 *
 * Returns null if the link is not defined.
 */
export const parsePageParamsFromLink = (link: Link | undefined | null): PageParams | null => {
    if (!link) {
        return null;
    }

    const url = new URL(typeof link === "string" ? link : link.href);
    const pageParams: Record<string, string> = {};

    for (const [key, value] of url.searchParams.entries()) {
        const match = pageParamRegexp.exec(key);

        if (match) {
            pageParams[match[1]] = value;
        }
    }

    if (Object.keys(pageParams).length === 0) {
        throw new Error(`No page params found in link ${url.toString()}`);
    }

    return pageParams;
};

/**
 * Require a page parameter to be set
 */
export const requirePageParams = (params: PageParams | null): PageParams => {
    if (!params) {
        throw new Error("Missing page params");
    }

    return params;
};

export const injectPageParams = (url: URL, pageParams?: PageParams): void => {
    if (!pageParams) {
        return;
    }

    for (const [key, value] of Object.entries(pageParams)) {
        url.searchParams.set(`page[${key}]`, value);
    }
};
