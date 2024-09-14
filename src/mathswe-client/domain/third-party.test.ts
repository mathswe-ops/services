// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { describe, expect, it } from "vitest";
import { thirdPartyFromString, thirdPartyToDomainName } from "./third-party";
import { isLeft, isRight, left, right } from "fp-ts/Either";

describe("thirdPartyToDomainName", () => {
    it("should return the correct domain name for GitHubCom", () => {
        const result = thirdPartyToDomainName.toDomainName("GitHubCom");

        expect(result).toBe("github.com");
    });
});

describe("FromString", () => {
    it(
        "should return Right(GitHubCom) when the input is \"github.com\"",
        () => {
            const result = thirdPartyFromString.fromString("github.com");

            expect(isRight(result)).toBe(true);
            expect(result).toEqual(right("GitHubCom"));
        },
    );

    it(
        "should return Left with an error message when the input is invalid",
        () => {
            const result = thirdPartyFromString.fromString("invalid.com");

            expect(isLeft(result)).toBe(true);
            expect(result).toEqual(left("Invalid ThirdParty string."));
        },
    );

    it(
        "should return Left with an error message when the input is an empty string",
        () => {
            const result = thirdPartyFromString.fromString("");

            expect(isLeft(result)).toBe(true);
            expect(result).toEqual(left("Invalid ThirdParty string."));
        },
    );

    it(
        "should return Left with an error message when the input is an unknown domain",
        () => {
            const result = thirdPartyFromString.fromString("bitbucket.org");

            expect(isLeft(result)).toBe(true);
            expect(result).toEqual(left("Invalid ThirdParty string."));
        },
    );
});
