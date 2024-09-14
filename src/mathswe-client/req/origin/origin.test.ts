// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { describe, expect, it } from "vitest";
import { newUrlFromString, SecureUrl } from "../http";
import { newOriginFromString, newOriginFromUrl } from "./origin";
import { identity, pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { Either, isLeft, isRight, left } from "fp-ts/Either";
import { mathSweDomain } from "./origin-domain";

function requireRight<L, R>(result: Either<L, R>) {
    return pipe(
        result,
        E.fold(
            error => {
                throw new Error(JSON.stringify(error));
            },
            identity,
        ),
    );
}

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

            const { domain, url } = requireRight(result);
            const expectedDomain = mathSweDomain("MathSweCom");

            expect(domain).toEqual(expectedDomain);
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

            const { domain, url } = requireRight(result);
            const expectedDomain = mathSweDomain("MathSweCom");
            const expectedUrl: SecureUrl = pipe(
                "https://mathswe.com",
                newUrlFromString,
                requireRight,
            );

            expect(domain).toEqual(expectedDomain);
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
