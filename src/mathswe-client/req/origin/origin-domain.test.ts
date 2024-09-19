// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { describe, expect, it } from "vitest";
import {
    mathSweDomain,
    newOriginPathFromDomain,
    OriginDomain,
    originDomainFromString,
    thirdPartyDomain,
    toDomainName,
} from "./origin-domain";
import { isLeft, isRight, left, right } from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { requireRight } from "../../../mathswe-ts/require";
import { newPathFromString } from "../http";

describe("toDomainName for OriginDomain", () => {
    it("should return the correct domain name for MathSweCom", () => {
        const domain: OriginDomain = mathSweDomain("MathSweCom");
        const result = toDomainName.toDomainName(domain);

        expect(result).toBe("mathswe.com");
    });

    it("should return the correct domain name for MathSoftware", () => {
        const domain: OriginDomain = mathSweDomain("MathSoftware");
        const result = toDomainName.toDomainName(domain);

        expect(result).toBe("math.software");
    });

    it("should return the correct domain name for MathSoftwareEngineer", () => {
        const domain: OriginDomain = mathSweDomain("MathSoftwareEngineer");
        const result = toDomainName.toDomainName(domain);

        expect(result).toBe("mathsoftware.engineer");
    });

    it("should return the correct domain name for GitHubCom", () => {
        const domain: OriginDomain = thirdPartyDomain("GitHubCom");
        const result = toDomainName.toDomainName(domain);

        expect(result).toBe("github.com");
    });
});

describe("FromString for OriginDomain", () => {
    it(
        "should return Right(MathSweCom) when the input is \"mathswe.com\"",
        () => {
            const result = originDomainFromString.fromString("mathswe.com");

            expect(isRight(result)).toBe(true);
            expect(result).toEqual(right(mathSweDomain("MathSweCom")));
        },
    );

    it(
        "should return Right(GitHubCom) when the input is \"github.com\"",
        () => {
            const result = originDomainFromString.fromString("github.com");

            expect(isRight(result)).toBe(true);
            expect(result).toEqual(right(thirdPartyDomain("GitHubCom")));
        },
    );

    it(
        "should return Left with an error message when the input is an unaccepted domain",
        () => {
            const result = originDomainFromString.fromString("invalid.com");

            expect(isLeft(result)).toBe(true);
            expect(result).toEqual(left("Unaccepted origin domain."));
        },
    );
});

describe("newOriginPathFromDomain", () => {
    it("should return path for FullAccess domain", () => {
        const domain: OriginDomain = pipe(
            "mathswe.com",
            originDomainFromString.fromString,
            requireRight,
        );

        const path = "/any-path";
        const expected = right(pipe(path, newPathFromString, requireRight));
        const result = pipe(path, newOriginPathFromDomain(domain));

        expect(result).toEqual(expected);
    });

    it("should return an error for a restricted domain path", () => {
        const domain: OriginDomain = pipe(
            "github.com",
            originDomainFromString.fromString,
            requireRight,
        );

        // github.com/restricted-path random user
        const path = "restricted-path";
        const expected = left(`Path ${ path } of domain ${ domain } is restricted.`);
        const result = pipe(path, newOriginPathFromDomain(domain));

        expect(result).toEqual(expected);
    });

    it("should accept partially allowed path", () => {
        const domain: OriginDomain = pipe(
            "github.com",
            originDomainFromString.fromString,
            requireRight,
        );

        // github.com/mathswe organization
        const path = "mathswe";
        const expected = right(pipe(path, newPathFromString, requireRight));
        const result = pipe(path, newOriginPathFromDomain(domain));

        expect(result).toEqual(expected);
    });
});
