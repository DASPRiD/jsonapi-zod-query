import type { Link } from "./standard-schemas.ts";

const pageParamRegexp = /^page\[([a-zA-Z0-9]+)]$/;
export type PageParams = Record<string, string>;

export const parsePageParamsFromLink = (
    link: Link | undefined | null,
): PageParams | undefined | null => {
    if (link === undefined || link === null) {
        return link;
    }

    const url = new URL(typeof link === "string" ? link : link.href, "http://localhost");
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

export const injectPageParams = (url: URL, pageParams?: PageParams | null): void => {
    if (!pageParams) {
        return;
    }

    for (const [key, value] of Object.entries(pageParams)) {
        url.searchParams.set(`page[${key}]`, value);
    }
};
