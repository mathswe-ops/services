// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import {
    newHostnameFromString,
    newPathFromString,
    newUrlFromString,
} from "./http";
import { left, right } from "fp-ts/Either";
import { describe, expect, test } from "vitest";

describe("newHostnameFromString", () => {
    test(
        "should return valid Hostname for a well-formed hostname with subdomain",
        () => {
            const input = "sub.example.com";
            const expected = right({
                domainName: "example.com",
                subdomain: "sub",
            });

            expect(newHostnameFromString(input)).toEqual(expected);
        },
    );

    test(
        "should return valid Hostname for a hostname without subdomain",
        () => {
            const input = "example.com";
            const expected = right({
                domainName: "example.com",
                subdomain: "",
            });

            expect(newHostnameFromString(input)).toEqual(expected);
        },
    );

    test(
        "should return an error for an invalid hostname with uppercase letters",
        () => {
            const input = "Sub.Example.Com";
            const expected = left("Invalid hostname format.");

            expect(newHostnameFromString(input)).toEqual(expected);
        },
    );

    test("should return an error for a single-part hostname", () => {
        const input = "example";
        const expected
            = left("Hostname must have at least two parts (SLD and TLD).");

        expect(newHostnameFromString(input)).toEqual(expected);
    });

    test("should return an error for an empty string", () => {
        const input = "";
        const expected = left("Invalid hostname format.");

        expect(newHostnameFromString(input)).toEqual(expected);
    });

    test(
        "should return an error for a hostname with invalid characters",
        () => {
            const input = "sub!example.com";
            const expected = left("Invalid hostname format.");

            expect(newHostnameFromString(input)).toEqual(expected);
        },
    );

    test("should return valid Hostname for hostname with only digits", () => {
        const input = "123.456.com";
        const expected = right({
            domainName: "456.com",
            subdomain: "123",
        });

        expect(newHostnameFromString(input)).toEqual(expected);
    });

    test("should return valid Hostname for a long subdomain chain", () => {
        const input = "long.subdomain.chain.example.com";
        const expected = right({
            domainName: "example.com",
            subdomain: "long.subdomain.chain",
        });

        expect(newHostnameFromString(input)).toEqual(expected);
    });
});

describe("newPathFromString", () => {
    test("should return valid Path for a well-formed path string", () => {
        const input = "home/user/documents";
        const expected = right(["home", "user", "documents"]);

        expect(newPathFromString(input)).toEqual(expected);
    });

    test("should handle leading slashes in the path", () => {
        const input = "/root/bin/scripts";
        const expected = right([
            "root",
            "bin",
            "scripts",
        ]);

        expect(newPathFromString(input)).toEqual(expected);
    });

    test("should handle trailing slashes in the path", () => {
        const input = "var/log/nginx/";
        const expected = right(["var", "log", "nginx"]);

        expect(newPathFromString(input)).toEqual(expected);
    });

    test("should handle consecutive slashes in the path", () => {
        const input = "usr//local/bin//";
        const expected = right(["usr", "local", "bin"]);

        expect(newPathFromString(input)).toEqual(expected);
    });

    test("should handle an empty path", () => {
        const input = "";
        const expected = right([]);

        expect(newPathFromString(input)).toEqual(expected);
    });

    test("should handle a single slash path", () => {
        const input = "/";
        const expected = right([]);

        expect(newPathFromString(input)).toEqual(expected);
    });

    test("should handle a single directory", () => {
        const input = "usr";
        const expected = right(["usr"]);

        expect(newPathFromString(input)).toEqual(expected);
    });

    test("should handle a complex path with mixed slashes", () => {
        const input = "/var//www/html//index/";
        const expected = right([
            "var",
            "www",
            "html",
            "index",
        ]);

        expect(newPathFromString(input)).toEqual(expected);
    });
});

describe("newUrlFromString", () => {
    test("should return valid SecureUrl for a well-formed HTTPS URL", () => {
        const input = "https://sub.example.com/home/user/documents";
        const expected = right({
            hostname: { domainName: "example.com", subdomain: "sub" },
            path: ["home", "user", "documents"],
        });

        expect(newUrlFromString(input)).toEqual(expected);
    });

    test("should handle URLs with trailing slashes in the path", () => {
        const input = "https://example.com/";
        const expected = right({
            hostname: { domainName: "example.com", subdomain: "" },
            path: [],
        });

        expect(newUrlFromString(input)).toEqual(expected);
    });

    test("should handle URLs with only hostname and no path", () => {
        const input = "https://example.com";
        const expected = right({
            hostname: { domainName: "example.com", subdomain: "" },
            path: [],
        });

        expect(newUrlFromString(input)).toEqual(expected);
    });

    test("should handle URLs with subdomain and path", () => {
        const input = "https://subdomain.example.com/path/to/resource";
        const expected = right({
            hostname: { domainName: "example.com", subdomain: "subdomain" },
            path: ["path", "to", "resource"],
        });

        expect(newUrlFromString(input)).toEqual(expected);
    });

    test("should return Left for a URL with an invalid protocol", () => {
        const input = "http://example.com/path/to/resource";
        const expected = left("URL does not have the HTTPS protocol.");

        expect(newUrlFromString(input)).toEqual(expected);
    });

    test("should return Left for a URL without a hostname", () => {
        const input = "https:///path/to/resource";
        const expected = left("Invalid hostname format.");

        expect(newUrlFromString(input)).toEqual(expected);
    });

    test("should return Left for an empty URL", () => {
        const input = "";
        const expected = left("URL does not have the HTTPS protocol.");

        expect(newUrlFromString(input)).toEqual(expected);
    });

    test(
        "should handle URLs with only path and no hostname (invalid case)",
        () => {
            const input = "https:///path/to/resource";
            const expected = left("Invalid hostname format.");

            expect(newUrlFromString(input)).toEqual(expected);
        },
    );

    test("should handle URLs with complex paths", () => {
        const input = "https://example.com/complex/path/with/various/segments";
        const expected = right({
            hostname: { domainName: "example.com", subdomain: "" },
            path: ["complex", "path", "with", "various", "segments"],
        });

        expect(newUrlFromString(input)).toEqual(expected);
    });
});
