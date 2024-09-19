// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { describe, expect, it } from "vitest";
import { newPathFromString, newUrlFromString, SecureUrl } from "../http";
import { newOriginFromString, newOriginFromUrl } from "./origin";
import { pipe } from "fp-ts/function";
import { isLeft, isRight, left } from "fp-ts/Either";
import { mathSweDomain } from "./origin-domain";
import { requireRight } from "../../../mathswe-ts/require";

describe("newOriginFromUrl", () => {
    it(
        "should return Right(Origin) when accepted SecureUrl is provided",
        () => {
            const secureUrl: SecureUrl = pipe(
                "https://mathswe.com",
                newUrlFromString,
                requireRight,
            );
            const result = newOriginFromUrl(secureUrl);

            expect(isRight(result)).toBe(true);

            const { domain, path, url } = requireRight(result);
            const expectedDomain = mathSweDomain("MathSweCom");
            const expectedPath = pipe("", newPathFromString, requireRight);

            expect(domain).toEqual(expectedDomain);
            expect(path).toEqual(expectedPath);
            expect(url).toEqual(secureUrl);
        },
    );
});

describe("newOriginFromString", () => {
    it(
        "should return Right(Origin) when a valid origin string is provided",
        () => {
            const originString = "https://mathswe.com";
            const result = newOriginFromString(originString);

            expect(isRight(result)).toBe(true);

            const { domain, path, url } = requireRight(result);
            const expectedDomain = mathSweDomain("MathSweCom");
            const expectedPath = pipe("", newPathFromString, requireRight);
            const expectedUrl: SecureUrl = pipe(
                "https://mathswe.com",
                newUrlFromString,
                requireRight,
            );

            expect(domain).toEqual(expectedDomain);
            expect(path).toEqual(expectedPath);
            expect(url).toEqual(expectedUrl);
        },
    );

    it("should return Left when an invalid origin string is provided", () => {
        const originString = "invalid-origin";
        const result = newOriginFromString(originString);

        expect(isLeft(result)).toBe(true);
        expect(result).toEqual(left("URL does not have the HTTPS protocol."));
    });
});

describe("newOriginFromUrl", () => {
    it(
        "should return a valid Origin when domain and path are allowed",
        () => {
            const expectedUrl: SecureUrl = pipe(
                "https://mathswe.com/valid-path",
                newUrlFromString,
                requireRight,
            );

            const result = newOriginFromUrl(expectedUrl);
            const { domain, path, url } = requireRight(result);
            const expectedDomain = mathSweDomain("MathSweCom");
            const expectedPath = pipe(
                "valid-path",
                newPathFromString,
                requireRight,
            );

            expect(domain).toEqual(expectedDomain);
            expect(path).toEqual(expectedPath);
            expect(url).toEqual(expectedUrl);
        },
    );

    it("should return an error if the domain is disallowed", () => {
        const result = newOriginFromString("example.com/some-path");

        expect(isLeft(result)).toBe(true);
    });

    it("should return an error if the path is restricted", () => {
        const url: SecureUrl = pipe(
            "https://github.com/restricted-path",
            newUrlFromString,
            requireRight,
        );
        const result = newOriginFromUrl(url);

        expect(isLeft(result)).toBe(true);
    });
});
